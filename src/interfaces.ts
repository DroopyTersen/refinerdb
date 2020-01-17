export enum IndexType {
  String = "string",
  Number = "number",
  Date = "Date",
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

export interface SearchIndexerConfig {
  onIndexStart?: () => void;
  onIndexSuccess?: () => void;
  indexDelay: number;
  itemsIndexSchema?: string;
  onTransition?: (state: IndexState) => void;
}

export interface IndexFilter {
  indexKey: string;
  indexDefinition?: IndexConfig;
  values?: string[] | number[];
  min?: string | number | Date;
  max?: string | number | Date;
}

export interface IndexResult {
  indexKey: string;
  matches: number[];
  refinerOptions: RefinerOption[];
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

export interface QueryResult {
  key: string;
  items: any[];
  refiners: {
    [key: string]: RefinerOption[];
  };
}
