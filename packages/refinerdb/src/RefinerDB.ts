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
} from "./interfaces";
import * as Comlink from "comlink";
import { indexers, checkIfModifiedIndexes } from "./helpers/indexers";
import { createStateMachine, createMachineConfig } from "./stateMachine";
import { Interpreter } from "xstate";
import { setCache, getCache } from "./helpers/cache";
import reindex from "./transactions/reindex";
import query from "./transactions/query";
import { setItems, pushItems } from "./transactions/setItems";
import createMeasurement from "./utils/utils";

export default class RefinerDB extends Dexie {
  static destroy = (dbName: string) => {
    Dexie.delete(dbName);
  };
  id: string = "";
  allItems: Dexie.Table<any, number>;
  indexes: Dexie.Table<SearchIndex, string>;
  filterResults: Dexie.Table<FilterResult, string>;
  queryResults: Dexie.Table<QueryResult, string>;

  _criteria: QueryCriteria = { filter: null };
  _indexRegistrations: IndexConfig[] = [];
  private stateMachine: Interpreter<any>;
  private worker = null;
  config: RefinerDBConfig = {
    indexDelay: 750,
    itemsIndexSchema: "++__itemId",
    isWebWorker: false,
  };

  constructor(dbName: string, config?: RefinerDBConfig) {
    super(dbName);
    this.id = new Date().getTime().toString();
    this.config = {
      ...this.config,
      ...config,
    };
    this.initDB();
    // Setup StateMachine
    this.stateMachine = createStateMachine(
      createMachineConfig(this._reIndex, this._query, this.config.indexDelay),
      this.config.onTransition
    );
    // If it's not a webworker, pull index registrations from localstorage
    if (!this.config.isWebWorker) {
      this._indexRegistrations = getCache(this.name + "-indexes") || [];
    }

    // Set index registrations if they are passed in
    if (this.config.indexes && this.config.indexes.length) {
      this._indexRegistrations = this.config.indexes;
    }
    // Try to setup the comlink webworker
    if (this.config.worker) {
      this.worker = Comlink.wrap(this.config.worker);
      console.log("TCL: RefinerDB -> constructor -> worker", this.worker);
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
    // use the WebWorker if there is one
    if (this.worker) {
      await this.worker.setItems(this.name, items);
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
    let result = await this.queryResults.get(this.getCriteriaKey());
    return result;
  };

  query = async (criteria: QueryCriteria) => {
    if (criteria) {
      this.setCriteria(criteria);
    }
    return this.getQueryResult();
  };

  _query = async (queryId: number = Date.now()): Promise<QueryResult> => {
    if (this.worker) {
      return this.worker.query(this.name, this._indexRegistrations, this.criteria);
    } else {
      return query(this, queryId);
    }
  };

  _reIndex = async (indexingId: number = Date.now()) => {
    if (this.worker) {
      await this.worker.reindex(this.name, this._indexRegistrations);
    } else {
      await reindex(this, indexingId);
    }
  };
}
