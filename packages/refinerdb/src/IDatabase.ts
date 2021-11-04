import { FilterResult, QueryResult, SearchIndex } from ".";

export type DBItem =
  | {
      id: string | number;
    }
  | { key: string | number };

export interface IDatabase<T extends DBItem> {
  query: (params: {
    indexes: ITable<SearchIndex>;
    allItems: ITable<T>;
    filterResults: ITable<FilterResult>;
    queryResults: ITable<QueryResult<T>>;
  }) => Promise<void>;
  reindex: () => Promise<void>;
  setItems: (items: T[]) => Promise<void>;
  pushItems: (items: T[]) => Promise<void>;
  transaction: (work: () => Promise<void>) => Promise<void>;
}

export interface ITable<T extends DBItem> {
  /** Clear all rows in the table */
  clear: () => Promise<void>;
  /** remove a row from the table */
  remove: (key: string) => Promise<void>;
  /** Get a row by primary key */
  get: (key: string) => Promise<T>;
  /** Loop through all rows in the table */
  each: (callback: (row: T, { primaryKey }) => void) => Promise<void>;
  /** Replace all the items in the  */
  bulkAdd: (items: T[]) => Promise<void>;
  /** Ins */
  bulkPut: (items: T[]) => Promise<void>;
}
