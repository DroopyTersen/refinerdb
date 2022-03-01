import * as Comlink from "comlink";
import { PersistedStore } from "../..";
import { BasePersistedStore } from "../BasePersistedStore";
import { LocalStorageCollection } from "./LocalStorageCollection";

interface LocalStorageStoreParams {
  idProperty?: string;
  worker: Worker;
}
export class LocalStorageStore extends BasePersistedStore implements PersistedStore {
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
}

export const createLocalStorageStore = (
  dbName: string,
  { idProperty = "id", worker = null } = {}
) => {
  return new LocalStorageStore(dbName, { idProperty, worker });
};
