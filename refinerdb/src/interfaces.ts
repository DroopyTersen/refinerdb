export enum IndexType {
  String = "string",
  Number = "number",
  Date = "Date",
}

export interface RefinderDBConfig {
  onIndexStart?: () => void;
  onIndexSuccess?: () => void;
  indexDelay: number;
  itemsIndexSchema?: string;
  onTransition?: (state: IndexState) => void;
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

export interface IndexConfig {
  key: string;
  type: IndexType;
  hashFn: (item: any) => any;
  skipRefinerOptions?: boolean;
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
  hashFn: (item: any) => any;
  skipRefinerOptions?: boolean;
}

export interface QueryCriteria {
  filter: Filter;
  sort?: string;
  sortDir?: "asc" | "desc";
  limit?: number;
  skip?: number;
  includeRefiners?: boolean;
}

export interface FilterResult {
  indexKey: string;
  key: string;
  matches: number[];
}
export interface QueryResult {
  items: any[];
  refiners: {
    [key: string]: RefinerOption[];
  };
  totalCount: number;
}
