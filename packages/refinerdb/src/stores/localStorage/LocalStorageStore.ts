import { BasePersistedStore } from "../BasePersistedStore";
import Dexie from "dexie";
import { QueryParams, QueryResult, PersistedStore, ReindexParams } from "../..";
import _query from "../../transactions/query/_query";
import { LocalStorageCollection } from "./LocalStorageCollection";

export class LocalStorageStore extends BasePersistedStore implements PersistedStore {
  constructor(dbName) {
    super();
    this.allItems = new LocalStorageCollection(dbName, "allItems");
    this.indexes = new LocalStorageCollection(dbName, "indexes");
    this.filterResults = new LocalStorageCollection(dbName, "filterResults");
    this.queryResults = new LocalStorageCollection(dbName, "queryResults");
  }

  destroy = async () => {
    localStorage.clear();
  };

  query = async (params: QueryParams): Promise<QueryResult> => {
    return _query(this, params);
  };

  reindex = async (params: ReindexParams) => {};

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

export const createLocalStorageStore = (dbName: string) => {
  return new LocalStorageStore(dbName);
};
