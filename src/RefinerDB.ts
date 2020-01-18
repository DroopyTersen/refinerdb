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

  private stateMachine: Interpreter<any>;
  private indexRegistrations: IndexConfig[] = [];
  private activeIndexingId = -1;
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
      createMachineConfig(this._reIndex, this.config.indexDelay),
      this.config.onTransition
    );
  }

  initDB = () => {
    this.version(1).stores({
      allItems: this.config.itemsIndexSchema,
      indexes: "key",
      filterResults: "key",
    });
    this.allItems = this.table("allItems");
    this.indexes = this.table("indexes");
    this.filterResults = this.table("filterResults");
  };

  setIndexes = (indexes: IndexConfig[]) => {
    this.indexRegistrations = indexes;
    this.stateMachine.send(IndexEvent.INVALIDATE);
    // TODO: Trigger invalidate only if we have items and
    // the indexes aren't what we have in db already
    // this.allItems.count().then((count) => {
    //   if (count > 0) this.stateMachine.send(IndexEvent.INVALIDATE);
    // });
  };

  registerIndex = (index: IndexConfig) => {
    if (!index || !index.key) return;
    this.indexRegistrations = [
      ...this.indexRegistrations.filter((i) => i.key !== index.key),
      index,
    ];
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

  query = async (criteria: QueryCriteria) => {
    // if none, the actually do the querying
    this.stateMachine.send(IndexEvent.QUERY_START);
    await this.waitForState(IndexState.IDLE);
    return this._query(criteria);
  };

  // _query Just worries about filters.
  // It also only worries about getting the itemIds, not hydrating the items
  // It will cache the results using the stringified filters as the key
  _query = async (criteria: QueryCriteria): Promise<QueryResult> => {
    let result: QueryResult = null;
    let filters = parseFilter(criteria.filter);

    let allIndexes: SearchIndex[] = (await this.indexes.bulkGet(
      this.indexRegistrations.map((index) => index.key)
    )) as any;
    await this.transaction("rw", this.indexes, this.allItems, this.filterResults, async () => {
      // Get an array of arrays. where we store a set of itemId matches for each filter
      let filterResults: FilterResult[] = [];
      for (var i = 0; i < filters.length; i++) {
        let filter = filters[i];
        let filterKey = filterToString(filter);
        let matches = [];
        let indexDefinition = this.indexRegistrations.find((i) => i.key === filter.indexKey);
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

      if (criteria.includeRefiners) {
        let allRefinerOptions = this.indexRegistrations.map((indexRegistration, i) => {
          if (indexRegistration.skipRefinerOptions) {
            return [];
          }
          let index = allIndexes.find((i) => i.key === indexRegistration.key);
          return finders.getRefinerOptions(index, filterResults);
        });

        refiners = allRefinerOptions.reduce((refiners, options, i) => {
          refiners[this.indexRegistrations[i].key] = options;
          return refiners;
        }, {});
      }

      let itemIds: number[] = [];
      // If there are no filters, return all items
      if (filterResults.length === 0) {
        itemIds = this.allItems.toCollection().primaryKeys() as any;
      } else {
        // There are filters so return the intersection of all the matches
        itemIds = intersection(...filterResults.map((r) => r.matches).filter(Boolean));
      }
      // TODO: how to handle sort?

      let skip = criteria.skip || 0;
      let limit = criteria.limit || 1000;
      let trimmedIds = itemIds.slice(skip, skip + limit);

      let items = await this.allItems.bulkGet(trimmedIds);

      result = { items, refiners, totalCount: items.length };
    });

    return result;
  };

  _reIndex = (indexingId: number = Date.now()) => {
    this.activeIndexingId = indexingId;
    return this.transaction("rw", this.allItems, this.indexes, this.filterResults, () => {
      this.filterResults.clear();
      let indexes: SearchIndex[] = this.indexRegistrations.map((index) => {
        return {
          ...index,
          value: {},
          sortedKeys: [],
        };
      });
      // Loop through each items
      this.allItems
        .each((item, { primaryKey }) => {
          this.indexRegistrations.forEach((indexDefinition, i) => {
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
    });
  };
}
