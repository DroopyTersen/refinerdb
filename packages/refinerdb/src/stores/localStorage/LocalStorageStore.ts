import { PersistedStore, QueryParams, QueryResult, ReindexParams } from "../..";
import { indexItems } from "../../transactions/indexItems";
import _query from "../../transactions/query/_query";
import { BasePersistedStore } from "../BasePersistedStore";
import { LocalStorageCollection } from "./LocalStorageCollection";

export class LocalStorageStore extends BasePersistedStore implements PersistedStore {
  constructor(dbName, idProperty = "id") {
    super();
    this.allItems = new LocalStorageCollection(dbName, "allItems", idProperty);
    this.indexes = new LocalStorageCollection(dbName, "indexes", "key");
    this.filterResults = new LocalStorageCollection(dbName, "filterResults", "key");
    this.queryResults = new LocalStorageCollection(dbName, "queryResults", "key");
  }

  destroy = async () => {
    localStorage.clear();
  };

  query = async (params: QueryParams): Promise<QueryResult> => {
    return _query(this, params);
  };

  reindex = async (params: ReindexParams) => {
    this.filterResults.clear();
    this.queryResults.clear();
    this.indexes.clear();
    await indexItems(this, params);
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

export const createLocalStorageStore = (dbName: string) => {
  return new LocalStorageStore(dbName);
};
