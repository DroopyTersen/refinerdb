import { BasePersistedStore } from "../BasePersistedStore";
import Dexie from "dexie";
import { QueryParams, QueryResult, PersistedStore, ReindexParams } from "../..";
import _query from "../../transactions/query/_query";
import { indexItems } from "../../transactions/indexItems";

export class DexieStore extends BasePersistedStore implements PersistedStore {
  db: Dexie;

  constructor(dbName) {
    super();
    this.db = new Dexie(dbName);
    this.initDB();
  }

  destroy = async () => {
    this.db.delete();
  };
  initDB = () => {
    this.db.version(1).stores({
      allItems: "++__itemId",
      indexes: "key",
      filterResults: "key",
      queryResults: "key",
    });
    this.allItems = this.db.table("allItems");
    this.indexes = this.db.table("indexes");
    this.filterResults = this.db.table("filterResults");
    this.queryResults = this.db.table("queryResults");
  };

  private transaction = async (work: () => Promise<any>) => {
    let result: any = null;
    await this.db.transaction(
      "rw",
      this.db.table("allItems"),
      this.db.table("indexes"),
      this.db.table("filterResults"),
      this.db.table("queryResults"),
      async () => {
        result = await work();
      }
    );

    return result;
  };

  query = async (params: QueryParams): Promise<QueryResult> => {
    return this.transaction(() => _query(this, params));
  };

  reindex = async (params: ReindexParams) => {
    return this.transaction(async () => {
      this.filterResults.clear();
      this.queryResults.clear();
      this.indexes.clear();
      await indexItems(this, params);
      return;
    });
  };

  setItems = async (items: any[]) => {
    return this.transaction(async () => {
      this.indexes.clear();
      this.filterResults.clear();
      this.allItems.clear();
      this.queryResults.clear();
      this.allItems.bulkAdd(items);
    });
  };

  pushItems = async (items: any[]) => {
    return this.transaction(async () => {
      this.indexes.clear();
      this.filterResults.clear();
      this.queryResults.clear();
      this.allItems.bulkPut(items);
    });
  };
}

export const createDexieStore = (dbName: string) => {
  return new DexieStore(dbName);
};
