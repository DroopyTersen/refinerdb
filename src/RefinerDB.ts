import Dexie from "dexie";
import {
  SearchIndex,
  IndexConfig,
  SearchIndexerConfig,
  IndexState,
  IndexEvent,
  IndexFilter,
  QueryResult,
  IndexResult,
} from "./interfaces";
import { indexers } from "./helpers/indexers";
import { createStateMachine, createMachineConfig } from "./stateMachine";
import { finders } from "./helpers/finders";
import intersection from "lodash/intersection";
import { Interpreter } from "xstate";
import omit from "lodash/omit";

export default class SearchIndexerDB extends Dexie {
  allItems: Dexie.Table<any, number>;
  indexes: Dexie.Table<SearchIndex, string>;
  queryResults: Dexie.Table<QueryResult, string>;
  metadata: Dexie.Table<any, string>;
  filters: IndexFilter[] = [];
  private stateMachine: Interpreter<any>;
  private indexRegistrations: IndexConfig[] = [];
  private activeIndexingId = -1;
  private activeQueryId = -1;
  config: SearchIndexerConfig = {
    indexDelay: 750,
    itemsIndexSchema: "++_id",
  };

  constructor(dbName: string, config?: SearchIndexerConfig) {
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
      queryResults: "key",
    });
    this.allItems = this.table("allItems");
    this.indexes = this.table("indexes");
    this.metadata = this.table("metadata");
    this.queryResults = this.table("queryResults");
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

  setFilters = (filters: IndexFilter[]) => {
    this.filters = filters;
    // Let the state machine handle triggering the query
    this.stateMachine.send(IndexEvent.QUERY_START);
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

  query = async () => {
    // check cached query results for a matching data key (stringified Query Params)

    // if none, the actually do the querying
    this.stateMachine.send(IndexEvent.QUERY_START);
    await this.waitForState(IndexState.IDLE);
    return;
  };

  _query = async (queryId: number = Date.now()): Promise<QueryResult> => {
    this.activeQueryId = queryId;
    let result: QueryResult = null;
    await this.transaction("r", this.indexes, this.allItems, () => {
      let allIndexes: SearchIndex[] = this.indexes.bulkGet(
        this.filters.map((f) => f.indexKey)
      ) as any;

      let results = this.filters.map((filter) => {
        return finders.findByIndexFilter(
          filter,
          allIndexes.find((i) => i.key === filter.indexKey)
        );
      });

      // console.log("TCL: results", results);
      let indexResults = results.map((matches, i) => {
        return {
          indexKey: this.filters[i].indexDefinition.key,
          matches,
        } as IndexResult;
      });

      let allRefinerOptions = indexResults.map((indexResult, i) => {
        if (this.filters[i].indexDefinition.skipRefinerOptions) {
          return [];
        }
        let index = allIndexes.find((i) => i.key === indexResult.indexKey);
        return finders.getRefinerOptions(index, indexResults);
      });

      let refiners = allRefinerOptions.reduce((refiners, options, i) => {
        refiners[this.filters[i].indexDefinition.key] = options;
        return refiners;
      }, {});

      let items = this.allItems.bulkGet(intersection(...results.filter(Boolean))) as any;

      if (this.activeQueryId !== queryId) {
        result = null;
      } else {
        result = { items, refiners, key: JSON.stringify(this.filters) };
      }
    });

    return result;
  };

  _reIndex = (indexingId: number = Date.now()) => {
    this.activeIndexingId = indexingId;
    return this.transaction("rw", this.allItems, this.indexes, this.queryResults, () => {
      // this.queryResults.clear();
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
