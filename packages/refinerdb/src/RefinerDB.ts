import { PersistedQueryResult, PersistedStore, QueryResult } from ".";
import { getCache, setCache } from "./helpers/cache";
import { checkIfModifiedIndexes } from "./helpers/indexers";
import { IndexConfig, IndexEvent, IndexState, QueryCriteria, RefinerDBConfig } from "./interfaces";
import { createRobotStateMachine, RefinerDBStateMachine } from "./stateMachine";
import { createLocalStorageStore } from "./stores/localStorage/LocalStorageStore";
import createMeasurement from "./utils/utils";

export default class RefinerDB {
  store: PersistedStore;
  name: string;
  queryResultRequest: {
    hydrateItems: boolean;
    criteriaKey: string;
    promise: Promise<QueryResult>;
  };
  _criteria: QueryCriteria = { filter: null };
  _indexRegistrations: IndexConfig[] = [];

  private stateMachine: RefinerDBStateMachine;

  config: RefinerDBConfig = {
    indexDelay: 750,
    itemsIndexSchema: "++__itemId",
  };

  constructor(dbName: string, config?: RefinerDBConfig) {
    this.config = {
      ...this.config,
      ...config,
    };
    this.name = dbName;
    // this.store = createDexieStore(dbName);
    this.store = config?.store || createLocalStorageStore(dbName);

    // Setup StateMachine
    this.stateMachine = createRobotStateMachine({
      reindex: () => this._reIndex(),
      query: () => this._query(),
      onTransition: this?.config?.onTransition,
      indexingDelay: this?.config?.indexDelay,
    });
    // If it's not a webworker, pull index registrations from localstorage
    if (!this.config.isWebWorker) {
      this._indexRegistrations = getCache(this.name + "-indexes") || [];
    }
    if (this.config.criteria) {
      this._criteria = this.config.criteria;
    }
    // Set index registrations if they are passed in
    if (this.config.indexes && this.config.indexes.length) {
      this._indexRegistrations = this.config.indexes;
    }
  }

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
    await this.store.setItems(items);
    this.stateMachine.send(IndexEvent.INVALIDATE);
  };

  // TODO: test for worker support
  pushItems = async (items: any[]) => {
    this.stateMachine.send(IndexEvent.INVALIDATE);
    await this.store.pushItems(items);
    this.stateMachine.send(IndexEvent.INVALIDATE);
  };

  waitForState = (targetState: IndexState) => {
    if (this.stateMachine.state.value === targetState) {
      return Promise.resolve(true);
    }
    return new Promise((resolve, reject) => {
      let handler = (state: IndexState) => {
        if (state === targetState) {
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

  _getQueryResult = async (hydrateItems = true) => {
    await this.waitForState(IndexState.IDLE);

    let persistedQueryResult = await this.store.queryResults.get(this.getCriteriaKey());
    if (hydrateItems === false) {
      return persistedQueryResult;
    }

    let hydrateItemsMeasurement = createMeasurement("query:hydrateItems - " + Date.now());
    hydrateItemsMeasurement.start();
    // Hydrate the items based in the array of itemIds
    let items = await this.store.allItems.bulkGet(persistedQueryResult?.itemIds || []);
    hydrateItemsMeasurement.stop();

    return {
      ...persistedQueryResult,
      items,
    };
  };
  getQueryResult = async (hydrateItems = true): Promise<QueryResult> => {
    let currentKey = this.getCriteriaKey();
    if (
      !this?.queryResultRequest?.promise ||
      this?.queryResultRequest?.criteriaKey !== currentKey ||
      (hydrateItems && !this?.queryResultRequest?.hydrateItems)
    ) {
      this.queryResultRequest = {
        hydrateItems,
        criteriaKey: currentKey,
        promise: this._getQueryResult(hydrateItems),
      };
    }

    return this.queryResultRequest.promise;
  };

  query = async (criteria: QueryCriteria) => {
    if (criteria) {
      this.setCriteria(criteria);
    }
    return this.getQueryResult();
  };

  _query = async (queryId: number = Date.now()): Promise<PersistedQueryResult> => {
    return this.store.query({
      queryId,
      indexRegistrations: this.indexRegistrations,
      criteria: this.criteria,
    });
  };

  _reIndex = async (indexingId: number = Date.now()) => {
    await this.store.reindex({
      indexingId,
      indexRegistrations: this.indexRegistrations,
    });
  };
}
