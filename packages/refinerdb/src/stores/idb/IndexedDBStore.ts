import * as Comlink from "comlink";
import { PersistedStore } from "../..";
import { BasePersistedStore } from "../BasePersistedStore";
import { IndexedDBCollection } from "./IndexedDBCollection";

interface IndexedDBStoreParams {
  idProperty?: string;
  worker: Worker;
}

export class IndexedDBStore extends BasePersistedStore implements PersistedStore {
  constructor(
    dbName,
    { idProperty = "id", worker }: IndexedDBStoreParams = { idProperty: "id", worker: null }
  ) {
    super();
    this.dbName = dbName;
    this.idProperty = idProperty;
    if (worker) {
      console.log("Setting up worker", worker);
      this.worker = Comlink.wrap(worker);
    }

    this.worker = worker;
    this.allItems = new IndexedDBCollection(dbName, "allItems", idProperty);
    this.indexes = new IndexedDBCollection(dbName, "indexes", "key");
    this.filterResults = new IndexedDBCollection(dbName, "filterResults", "key");
    this.queryResults = new IndexedDBCollection(dbName, "queryResults", "key");
  }

  destroy = async () => {
    this.allItems.clear();
    this.indexes.clear();
    this.filterResults.clear();
    this.queryResults.clear();
  };
}

export const createIndexedDBStore = (dbName: string, { idProperty = "id", worker = null } = {}) => {
  return new IndexedDBStore(dbName, { idProperty, worker });
};
