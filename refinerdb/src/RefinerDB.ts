import Dexie from "dexie";
import {
  SearchIndex,
  IndexConfig,
  RefinerDBConfig,
  IndexState,
  IndexEvent,
  QueryResult,
  FilterResult,
  QueryCriteria,
  Filter,
} from "./interfaces";
import { spawn, Thread, Worker } from "threads";
import { indexers, checkIfModifiedIndexes } from "./helpers/indexers";
import { createStateMachine, createMachineConfig } from "./stateMachine";
import { finders } from "./helpers/finders";
import intersection from "lodash/intersection";
import { Interpreter } from "xstate";
import omit from "lodash/omit";
import { parseFilter, filterToString } from "./helpers/filterParser";
import { setCache, getCache } from "./helpers/cache";
import reindex from "./transactions/reindex";
import { setItems, pushItems } from "./transactions/setItems";

export default class RefinerDB extends Dexie {
  static destroy = (dbName: string) => {
    Dexie.delete(dbName);
  };
  allItems: Dexie.Table<any, number>;
  indexes: Dexie.Table<SearchIndex, string>;
  filterResults: Dexie.Table<FilterResult, string>;
  queryResults: Dexie.Table<QueryResult, string>;

  _criteria: QueryCriteria = { filter: null };
  _indexRegistrations: IndexConfig[] = [];
  private stateMachine: Interpreter<any>;
  private activeIndexingId = -1;
  private activeQueryId = -1;
  private worker;
  private workerIsReady;
  config: RefinerDBConfig = {
    indexDelay: 750,
    itemsIndexSchema: "++__itemId",
    isWebWorker: false,
  };

  constructor(dbName: string, config?: RefinerDBConfig) {
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
    if (this.config.indexes && this.config.indexes.length) {
      this._indexRegistrations = this.config.indexes;
    }
    if (this.config.workerPath) {
      this.workerIsReady = spawn(new Worker(this.config.workerPath)).then(
        (worker) => (this.worker = worker)
      );
    }
    if (!this.config.isWebWorker) {
      this._indexRegistrations = getCache(this.name + "-indexes") || [];
    }
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
  setIndexes = (indexes: IndexConfig[], forceReindex = false) => {
    if (forceReindex === true || checkIfModifiedIndexes(this._indexRegistrations, indexes)) {
      this._indexRegistrations = indexes;
      if (!this.config.isWebWorker) {
        setCache(this.name + "-indexes", this._indexRegistrations);
      }
      this.stateMachine.send(IndexEvent.INVALIDATE);
    }
  };

  getIndexState = (): IndexState => {
    return this.stateMachine?.state?.value as IndexState;
  };

  setItems = async (items: any[]) => {
    this.stateMachine.send(IndexEvent.INVALIDATE);
    if (this.config.workerPath) {
      await this.workerIsReady;
      let result = await this.worker.setItems(this.name, items);
      console.log("TCL: setItems -> Web Worker result", result);
    } else {
      await setItems(this, items);
    }
    this.stateMachine.send(IndexEvent.INVALIDATE);
  };

  pushItems = async (items: any[]) => {
    this.stateMachine.send(IndexEvent.INVALIDATE);
    await pushItems(this, items);
    this.stateMachine.send(IndexEvent.INVALIDATE);
  };

  // deleteItems = async (filter?: Filter) => {
  //   // TODO: query using the filter for a set of itemId's to delete

  // }

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

    let allIndexes: SearchIndex[] = (
      await this.indexes.bulkGet(this._indexRegistrations.map((index) => index.key))
    ).filter(Boolean) as any;

    if (!allIndexes || !allIndexes.length) {
      // this.stateMachine.send(IndexEvent.INVALIDATE);
      return Promise.resolve(null);
    }

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
          console.log("TCL: allItems itemIds", itemIds);
        } else {
          // There are filters so return the intersection of all the matches
          itemIds = intersection(...filterResults.map((r) => r.matches).filter(Boolean));
          console.log("TCL: filtered itemIds", itemIds, filterResults.length);
        }
        // TODO: how to handle sort?

        let skip = this._criteria.skip || 0;
        let limit = this._criteria.limit || 1000;
        let trimmedIds = itemIds; // itemIds.slice(skip, skip + limit);

        let items = await this.allItems.bulkGet(trimmedIds);
        // Check for a stale query id after every async activity
        if (this.activeQueryId !== queryId) return;

        result = { items, refiners, totalCount: itemIds.length, key: this.getCriteriaKey() };
        this.queryResults.put(result);
      }
    );

    // Check for a stale query id after every async activity
    if (this.activeQueryId !== queryId) return;
    return result;
  };

  _reIndex = async (indexingId: number = Date.now()) => {
    if (this.config.workerPath) {
      await this.workerIsReady;
      let result = await this.worker.reindex(this.name, this._indexRegistrations);
      console.log("TCL: _reIndex -> Web Worker result", result);
    } else {
      return reindex(this, indexingId);
    }
  };
}
