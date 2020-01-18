import Dexie from "dexie";
import {
  SearchIndex,
  IndexConfig,
  RefinderDBConfig,
  IndexState,
  IndexEvent,
  QueryResult,
  FilterResult,
  QueryCriteria,
} from "./interfaces";
import { indexers } from "./helpers/indexers";
import { createStateMachine, createMachineConfig } from "./stateMachine";
import { finders } from "./helpers/finders";
import intersection from "lodash/intersection";
import { Interpreter } from "xstate";
import omit from "lodash/omit";
import { parseFilter, filterToString } from "./helpers/filterParser";

export default class SearchIndexerDB extends Dexie {
  allItems: Dexie.Table<any, number>;
  indexes: Dexie.Table<SearchIndex, string>;
  filterResults: Dexie.Table<FilterResult, string>;
  queryResults: Dexie.Table<QueryResult, string>;

  private _criteria: QueryCriteria = { filter: null };
  private _indexRegistrations: IndexConfig[] = [];

  private stateMachine: Interpreter<any>;
  private activeIndexingId = -1;
  private activeQueryId = -1;
  config: RefinderDBConfig = {
    indexDelay: 750,
    itemsIndexSchema: "++_id",
  };

  constructor(dbName: string, config?: RefinderDBConfig) {
    super(dbName);
    this.config = {
      ...this.config,
      ...config,
    };
    this.initDB();
    this.stateMachine = createStateMachine(
      createMachineConfig(this._reIndex, this._query, this.config.indexDelay),
      this.config.onTransition
    );
  }

  initDB = () => {
    this.version(1).stores({
      allItems: this.config.itemsIndexSchema,
      indexes: "key",
      filterResults: "key",
      queryResults: "key",
    });
    this.allItems = this.table("allItems");
    this.indexes = this.table("indexes");
    this.filterResults = this.table("filterResults");
  };

  get criteria() {
    return this._criteria;
  }
  setCriteria = (criteria: QueryCriteria) => {
    if (!criteria) {
      return;
    }
    this._criteria = criteria;
    this.stateMachine.send(IndexEvent.QUERY_START);
  };
  getCriteriaKey = () => {
    return JSON.stringify(this._criteria);
  };
  get indexRegistrations() {
    return this._indexRegistrations;
  }
  setIndexes = (indexes: IndexConfig[]) => {
    this._indexRegistrations = indexes;
    this.stateMachine.send(IndexEvent.INVALIDATE);
  };

  getIndexState = (): IndexState => {
    return this.stateMachine?.state?.value as IndexState;
  };

  setItems = async (items: any[]) => {
    // TODO: set IndexState
    this.stateMachine.send(IndexEvent.INVALIDATE);
    await this.transaction("rw", this.allItems, this.indexes, this.filterResults, () => {
      // TODO: queryResults.clear() throws an error if there are none?
      // this.queryResults.clear();
      this.indexes.clear();
      this.filterResults.clear();
      this.allItems.clear();
      this.allItems.bulkAdd(items);
    });
  };

  waitForState = (targetState: IndexState) => {
    return new Promise((resolve, reject) => {
      let handler = (state) => {
        if (state?.value === targetState) {
          this.stateMachine.off(handler);
          resolve(true);
        }
      };
      this.stateMachine.onTransition(handler);
    });
  };

  reIndex = async () => {
    this.stateMachine.send(IndexEvent.INDEX_START);
    await this.waitForState(IndexState.IDLE);
    return;
  };

  getQueryResult = async () => {
    await this.waitForState(IndexState.IDLE);
    return this.queryResults.get(this.getCriteriaKey());
  };

  query = async (criteria: QueryCriteria) => {
    if (criteria) {
      this.setCriteria(criteria);
    }
    return this.getQueryResult();
  };

  _query = async (queryId: number = Date.now()): Promise<QueryResult> => {
    this.activeQueryId = queryId;
    let result: QueryResult = null;
    let filters = parseFilter(this._criteria.filter);

    let allIndexes: SearchIndex[] = (await this.indexes.bulkGet(
      this._indexRegistrations.map((index) => index.key)
    )) as any;

    // Check for a stale query id after every async activity
    if (this.activeQueryId !== queryId) return;

    await this.transaction(
      "rw",
      this.indexes,
      this.allItems,
      this.filterResults,
      this.queryResults,
      async () => {
        // Get an array of arrays. where we store a set of itemId matches for each filter
        let filterResults: FilterResult[] = [];
        for (var i = 0; i < filters.length; i++) {
          let filter = filters[i];
          let filterKey = filterToString(filter);
          let matches = [];
          let indexDefinition = this._indexRegistrations.find((i) => i.key === filter.indexKey);
          let cachedFilterResult = this.filterResults.get(filterKey) as any;
          if (cachedFilterResult && cachedFilterResult.matches) {
            matches = cachedFilterResult.itemIds;
          } else {
            matches = finders.findByIndexFilter(
              { indexDefinition, ...filter },
              allIndexes.find((i) => i.key === filter.indexKey)
            );
            this.filterResults.put({ key: filterKey, matches, indexKey: filter.indexKey });
          }
          filterResults.push({
            indexKey: filter.indexKey,
            key: filterKey,
            matches,
          });
        }

        let refiners = null;

        if (this._criteria.includeRefiners !== false) {
          let allRefinerOptions = this._indexRegistrations.map((indexRegistration, i) => {
            if (indexRegistration.skipRefinerOptions) {
              return [];
            }
            let index = allIndexes.find((i) => i.key === indexRegistration.key);
            return finders.getRefinerOptions(index, filterResults);
          });

          refiners = allRefinerOptions.reduce((refiners, options, i) => {
            refiners[this._indexRegistrations[i].key] = options;
            return refiners;
          }, {});
        }

        let itemIds: number[] = [];
        // If there are no filters, return all items
        if (filterResults.length === 0) {
          itemIds = await this.allItems.toCollection().primaryKeys();
        } else {
          // There are filters so return the intersection of all the matches
          itemIds = intersection(...filterResults.map((r) => r.matches).filter(Boolean));
        }
        // TODO: how to handle sort?

        let skip = this._criteria.skip || 0;
        let limit = this._criteria.limit || 1000;
        let trimmedIds = itemIds.slice(skip, skip + limit);

        let items = await this.allItems.bulkGet(trimmedIds);
        // Check for a stale query id after every async activity
        if (this.activeQueryId !== queryId) return;

        result = { items, refiners, totalCount: items.length, key: this.getCriteriaKey() };
        this.queryResults.put(result);
      }
    );

    // Check for a stale query id after every async activity
    if (this.activeQueryId !== queryId) return;
    return result;
  };

  _reIndex = (indexingId: number = Date.now()) => {
    this.activeIndexingId = indexingId;
    return this.transaction(
      "rw",
      this.allItems,
      this.indexes,
      this.filterResults,
      this.queryResults,
      () => {
        this.filterResults.clear();
        this.queryResults.clear();
        let indexes: SearchIndex[] = this._indexRegistrations.map((index) => {
          return {
            ...index,
            value: {},
            sortedKeys: [],
          };
        });
        // Loop through each items
        this.allItems
          .each((item, { primaryKey }) => {
            this._indexRegistrations.forEach((indexDefinition, i) => {
              // STRING INDEX
              let indexer = indexers[indexDefinition.type];
              if (indexer) {
                indexer(item, primaryKey, indexes[i]);
              }
            });
          })
          .then(() => {
            indexes.forEach((index) => {
              index.sortedKeys = index.sortedKeys.sort();
              this.indexes.put(omit(index, "hashFn"));
            });
            if (this.activeIndexingId !== indexingId) {
              console.log("CANCELING TRANSACTION");
              Dexie.currentTransaction.abort();
            }
          });

        if (this.activeIndexingId !== indexingId) {
          console.log("CANCELING TRANSACTION");
          Dexie.currentTransaction.abort();
        }
      }
    );
  };
}
