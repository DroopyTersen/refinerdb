export enum IndexType {
  String = "string",
  Number = "number",
  Date = "Date",
}

export interface RefinerDBConfig {
  indexDelay?: number;
  itemsIndexSchema?: string;
  onTransition?: (state: IndexState) => void;
  // Let consumers pass in an instance of refinerdb.worker.js
  worker?: Worker;
  isWebWorker?: boolean;
  indexes?: IndexConfig[];
}

export enum IndexState {
  IDLE = "idle",
  STALE = "stale",
  PENDING = "pending",
  QUERYING = "querying",
  FAILED = "error",
}

export enum IndexEvent {
  INDEX_START = "index:start",
  INVALIDATE = "index:invalidate",
  RETRY = "index:retry",
  QUERY_START = "query:start",
}

export interface IndexFilter {
  indexKey: string;
  indexDefinition?: IndexConfig;
  values?: string[] | number[];
  min?: string | number | Date;
  max?: string | number | Date;
}

export type MinMaxFilterValue = { min?: number | Date | string; max?: number | Date | string };
export type StringFilterValue = string | string[];
export type NumberFilterValue = number | number[];

export interface Filter {
  [key: string]: MinMaxFilterValue | StringFilterValue | NumberFilterValue;
}

export interface RefinerOption {
  key: string;
  count: number;
}

export interface SearchIndex extends IndexConfig {
  value?: {
    [key: string]: number[];
  };
  sortedKeys?: any[];
  sortedIds?: number[];
}

export interface IndexConfig {
  key: string;
  type: IndexType;
  label?: string;
  path?: string;
  skipRefinerOptions?: boolean;
}

export interface QueryCriteria {
  filter?: Filter;
  sort?: string;
  sortDir?: "asc" | "desc";
  limit?: number;
  skip?: number;
}

export interface IndexFilterResult {
  indexKey: string;
  key: string;
  matches: number[];
}
export interface QueryResult<T = any> {
  key: string;
  items: T[];
  refiners: {
    [key: string]: RefinerOption[];
  };
  totalCount: number;
  timestamp: number;
}

export type DBItem =
  | {
      id: string | number;
    }
  | { key: string | number };

export interface PersistedStore<T extends DBItem = any> {
  query: () => Promise<void>;
  reindex: () => Promise<void>;
  setItems: (items: T[]) => Promise<void>;
  pushItems: (items: T[]) => Promise<void>;
  allItems: PersistedCollection<T>;
  filterResults: PersistedCollection<IndexFilterResult>;
  queryResults: PersistedCollection<QueryResult<T>>;
  indexes: PersistedCollection<IndexConfig>;
}

export interface PersistedCollection<T extends DBItem = any> {
  /** Clear all rows in the table */
  clear: () => Promise<void>;
  /** Get a row by primary key */
  get: (key: string) => Promise<T>;
  /** Put an item into the collection */
  put: (item: T) => Promise<any>;
  /** Loop through all rows in the table */
  each: (callback: (row: T, { primaryKey }) => void) => Promise<void>;
  /** Replace all the items in the  */
  bulkAdd: (items: any[]) => Promise<any>;
  /** Ins */
  bulkPut: (items: T[]) => Promise<void>;
  /** Get a bunch of items by IDs */
  bulkGet: (keys: string[]) => Promise<T[]>;
}
