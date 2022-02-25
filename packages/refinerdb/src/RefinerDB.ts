import { PersistedQueryResult, PersistedStore, QueryResult } from ".";
import { getCache, setCache } from "./helpers/cache";
import { cleanCriteria } from "./helpers/cleanCriteria";
import { checkIfModifiedIndexes } from "./helpers/indexers";
import { IndexConfig, IndexEvent, IndexState, QueryCriteria, RefinerDBConfig } from "./interfaces";
import {
  createRobotStateMachine,
  OnTransitionHandler,
  RefinerDBStateMachine,
} from "./stateMachine";
import { createLocalStorageStore } from "./stores/localStorage/LocalStorageStore";
import createMeasurement from "./utils/utils";

/** The big daddy class. Almost everything hinges off of this class. */
export default class RefinerDB {
  _store: PersistedStore;
  /** The database name */
  public name: string;

  private queryResultRequest: {
    hydrateItems: boolean;
    criteriaKey: string;
    promise: Promise<QueryResult>;
  };
  private _criteria: QueryCriteria = { filter: null };
  private _indexRegistrations: IndexConfig[] = [];

  private stateMachine: RefinerDBStateMachine;

  _config: RefinerDBConfig = {
    indexDelay: 750,
    idProperty: "id",
    // itemsIndexSchema: "++__itemId",
  };
  private getIndexRegistrationsCacheKey = () => {
    return this.name + "-indexRegistrations";
  };
  constructor(dbName: string, config?: RefinerDBConfig) {
    this._config = {
      ...this._config,
      ...config,
    };
    this.name = dbName;
    // this.store = createDexieStore(dbName);
    this._store = config?.store || createLocalStorageStore(dbName);

    // Setup StateMachine
    this.stateMachine = createRobotStateMachine({
      reindex: () => this._reIndex(),
      query: () => this._query(),
      onTransition: this?._config?.onTransition,
      indexingDelay: this?._config?.indexDelay,
    });
    // If it's not a webworker, pull index registrations from localstorage
    if (!this._config._isWebWorker) {
      this._indexRegistrations = getCache(this.getIndexRegistrationsCacheKey()) || [];
    }
    if (this._config.criteria) {
      this._criteria = this._config.criteria;
    }
    // Set index registrations if they are passed in
    if (this._config.indexes && this._config.indexes.length) {
      this._indexRegistrations = this._config.indexes;
    }
  }
  public onTransition = (handler: OnTransitionHandler): (() => void) => {
    this.stateMachine.onTransition(handler);

    return () => this.stateMachine.off(handler);
  };

  public getItemCount = async () => {
    return (await this?._store?.allItems?.count()) || 0;
  };

  /** The active QueryCriteria */
  public get criteria() {
    return this._criteria;
  }
  /** Update the QueryCriteria. This will trigger a requery */
  public setCriteria = (criteria: QueryCriteria) => {
    if (!criteria) {
      return;
    }
    this._criteria = cleanCriteria(criteria);
    this.stateMachine.send(IndexEvent.QUERY_START);
  };
  /** Return the JSON stringified criteria */
  getCriteriaKey = () => {
    return JSON.stringify(this._criteria);
  };
  /** The active index registrations */
  public get indexRegistrations() {
    return this._indexRegistrations;
  }
  /** Update the index registrations. This will trigger both a reindex and a requery */
  public setIndexes = (indexes: IndexConfig[], forceReindex = false) => {
    if (forceReindex === true || checkIfModifiedIndexes(this._indexRegistrations, indexes)) {
      this._indexRegistrations = indexes;
      if (!this._config._isWebWorker) {
        setCache(this.getIndexRegistrationsCacheKey(), this._indexRegistrations);
      }
      this.stateMachine.send(IndexEvent.INVALIDATE);
    }
  };

  /** Gets the current status of the internal state machine */
  public getIndexState = (): IndexState => {
    return this.stateMachine?.state?.value as IndexState;
  };

  /** Set the items that should be indexed and queried. */
  public setItems = async (items: any[]) => {
    await this._store.setItems(items);
    this.stateMachine.send(IndexEvent.INVALIDATE);
  };

  // TODO: test for worker support
  pushItems = async (items: any[]) => {
    this.stateMachine.send(IndexEvent.INVALIDATE);
    await this._store.pushItems(items);
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
  clearQueryResult = () => {
    if (this?.queryResultRequest?.promise) {
      this.queryResultRequest.promise = null;
    }
  };
  reindex = async () => {
    this.stateMachine.send(IndexEvent.INDEX_START);

    await this.waitForState(IndexState.IDLE);
    return;
  };

  private _getQueryResult = async (hydrateItems = true) => {
    await this.waitForState(IndexState.IDLE);

    let persistedQueryResult = await this._store.queryResults.get(this.getCriteriaKey());
    if (hydrateItems === false) {
      return persistedQueryResult;
    }

    let hydrateItemsMeasurement = createMeasurement("query:hydrateItems - " + Date.now());
    hydrateItemsMeasurement.start();
    // Hydrate the items based in the array of itemIds
    let items = await this._store.allItems.bulkGet(persistedQueryResult?.itemIds || []);
    hydrateItemsMeasurement.stop();

    return {
      ...persistedQueryResult,
      items,
    };
  };

  /** Waits for querying to complete then returns results based on the active criteria. */
  public getQueryResult = async (hydrateItems = true): Promise<QueryResult> => {
    let currentKey = this.getCriteriaKey();

    if (
      // If we don't have a cached query result to provide
      !this?.queryResultRequest?.promise ||
      // If the cached query result was for a differnt criteria
      this?.queryResultRequest?.criteriaKey !== currentKey ||
      // If everything is good, but this tiem they want to hydrate the items
      // and last time they didn't.
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

  /** Updates the active criteria then waits for a query to complete and returns the result */
  public query = async (criteria: QueryCriteria) => {
    if (criteria) {
      this.setCriteria(criteria);
    }
    return this.getQueryResult();
  };

  private _query = async (queryId: number = Date.now()): Promise<PersistedQueryResult> => {
    return this._store.query({
      queryId,
      indexRegistrations: this.indexRegistrations,
      criteria: this.criteria,
    });
  };

  private _reIndex = async (indexingId: number = Date.now()) => {
    this.clearQueryResult();
    await this._store.reindex({
      indexingId,
      indexRegistrations: this.indexRegistrations,
    });
  };
}
