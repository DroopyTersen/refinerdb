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

export interface FilterResult {
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
}
