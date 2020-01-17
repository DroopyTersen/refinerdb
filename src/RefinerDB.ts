import Dexie from "dexie";
import {
  SearchIndex,
  IndexConfig,
  RefinderDBConfig,
  IndexState,
  IndexEvent,
  IndexFilter,
  QueryResult,
  IndexFilterResult,
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
      metadata: "key",
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
    await this.transaction("rw", this.allItems, this.indexes, () => {
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
    await this.waitForState(IndexState.QUERYING);
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

    await this.transaction("rw", this.indexes, this.allItems, () => {
      let allIndexes: SearchIndex[] = this.indexes.bulkGet(filters.map((f) => f.indexKey)) as any;

      // Get an array of arrays. where we store a set of itemId matches for each filter
      let indexResults: IndexFilterResult[] = [];
      for (var i = 0; i < filters.length; i++) {
        let filter = filters[i];
        let filterKey = filterToString(filter);
        let matches = [];
        let cachedFilterResult = this.filterResults.get(filterKey) as any;
        if (cachedFilterResult && cachedFilterResult.itemIds) {
          matches = cachedFilterResult.itemIds;
        } else {
          matches = finders.findByIndexFilter(
            filter,
            allIndexes.find((i) => i.key === filter.indexKey)
          );
          this.filterResults.put({ key: filterKey, itemIds: matches });
        }
        indexResults.push({
          indexKey: filter.indexKey,
          matches,
          refinerOptions: [],
        });
      }

      let refiners = null;

      if (criteria.includeRefiners) {
        let allRefinerOptions = indexResults.map((indexResult, i) => {
          if (filters[i].indexDefinition.skipRefinerOptions) {
            return [];
          }
          let index = allIndexes.find((i) => i.key === indexResult.indexKey);
          return finders.getRefinerOptions(index, indexResults);
        });

        refiners = allRefinerOptions.reduce((refiners, options, i) => {
          refiners[filters[i].indexDefinition.key] = options;
          return refiners;
        }, {});
      }

      let itemIds = intersection(...indexResults.map((r) => r.matches).filter(Boolean));

      // TODO: handle sort, limit, and skip

      let items = this.allItems.bulkGet(itemIds) as any;

      result = { items, refiners, key: JSON.stringify(filters), totalCount: items.length };
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
