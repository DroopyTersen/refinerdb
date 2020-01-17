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
  onTransition: (state: IndexState) => void;
}
export interface IndexFilter {
  indexKey: string;
  indexDefinition?: IndexDefinition;
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

export interface SearchIndex {
  id: string;
  value: {
    [key: string]: number[];
  };
  sortedKeys?: any[];
}

export interface QueryResult {
  items: any[];
  refiners: {
    [key: string]: RefinerOption[];
  };
}
export interface IndexDefinition {
  key: string;
  type: IndexType;
  hashFn: (item: any) => any;
  skipRefinerOptions?: boolean;
}
