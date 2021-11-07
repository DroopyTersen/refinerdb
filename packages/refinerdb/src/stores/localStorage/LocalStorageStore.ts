import * as Comlink from "comlink";
import { PersistedQueryResult, PersistedStore, QueryParams, ReindexParams } from "../..";
import { indexItems } from "../../transactions/indexItems";
import _query from "../../transactions/query/query";
import { BasePersistedStore } from "../BasePersistedStore";
import { LocalStorageCollection } from "./LocalStorageCollection";

interface LocalStorageStoreParams {
  idProperty?: string;
  worker: Worker;
}
export class LocalStorageStore extends BasePersistedStore implements PersistedStore {
  private worker = null;
  private dbName: string;
  private idProperty: string;

  constructor(
    dbName,
    { idProperty = "id", worker }: LocalStorageStoreParams = { idProperty: "id", worker: null }
  ) {
    super();
    this.dbName = dbName;
    this.idProperty = idProperty;
    if (worker) {
      console.log("Setting up worker", worker);
      this.worker = Comlink.wrap(worker);
    }

    this.worker = worker;
    this.allItems = new LocalStorageCollection(dbName, "allItems", idProperty);
    this.indexes = new LocalStorageCollection(dbName, "indexes", "key");
    this.filterResults = new LocalStorageCollection(dbName, "filterResults", "key");
    this.queryResults = new LocalStorageCollection(dbName, "queryResults", "key");
  }

  destroy = async () => {
    localStorage.clear();
  };

  query = async (params: QueryParams): Promise<PersistedQueryResult> => {
    if (this.worker) {
      this.worker.query(this.dbName, this.idProperty, params);
    } else {
      return _query(this, params);
    }
  };

  reindex = async (params: ReindexParams) => {
    if (this.worker) {
      await this.worker.reindex(this.dbName, this.idProperty, params);
    } else {
      this.filterResults.clear();
      this.queryResults.clear();
      this.indexes.clear();
      await indexItems(this, params);
    }
  };

  setItems = async (items: any[]) => {
    await Promise.all([
      this.indexes.clear(),
      this.filterResults.clear(),
      this.allItems.clear(),
      this.queryResults.clear(),
    ]);
    await this.allItems.bulkAdd(items);
  };

  pushItems = async (items: any[]) => {
    await Promise.all([
      this.indexes.clear(),
      this.filterResults.clear(),
      this.queryResults.clear(),
    ]);
    await this.allItems.bulkPut(items);
  };
}

export const createLocalStorageStore = (
  dbName: string,
  { idProperty = "id", worker = null } = {}
) => {
  return new LocalStorageStore(dbName, { idProperty, worker });
};
