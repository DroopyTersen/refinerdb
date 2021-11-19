/** Map your data's properties to one of these available Indexing data types */
export enum IndexType {
  /** For indexing strings or arrays of strings */
  String = "string",
  /** For indexing numbers (float or int) or arrays of numbers */
  Number = "number",
  /** For indexing a date. If it's not a real JS Date, it will try to parse a string as a date. */
  Date = "Date",
}

/** The options you can pass to the RefinerDB constructor. */
export interface RefinerDBConfig {
  /**
   * How long in ms to wait before automatically triggering
   * a reindex. Defaults to 500ms.
   */
  indexDelay?: number;
  /**
   * The item property to use as the primary key.
   * Defaults to 'id'
   * */
  idProperty?: string;
  /**
   * Subscribe to changes in the indexing state
   * */
  onTransition?: (value: IndexState) => void;
  /**
   * The PersistedStore (localStorage, indexedDB, etc...)
   * Defaults to localStorage.
   */
  store?: PersistedStore;
  /**
   * Initialize the db with indexes so you don't
   * have to manually call setIndexes
   */
  indexes?: IndexConfig[];
  /**
   * Initialize the db with criteria so you don't
   * have to manually call setCriteria
   */
  criteria?: QueryCriteria;
  /**
   * Used internally to avoid having a Web Worker
   * spawn another Web Worker
   */
  _isWebWorker?: boolean;
}

/** Use by an internal state machine to manage the logic of when to reindex and requery. */
export enum IndexState {
  /**
   * Everything is up to date
   */
  IDLE = "idle",
  /**
   * There are new indexes, criteria, or items and we are waiting on a reindex. */
  STALE = "stale",
  /**
   * Reindex is in progress
   */
  PENDING = "pending",
  /**
   * A query is in progress
   */
  QUERYING = "querying",
  /**
   * An error occured
   */
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
  /**
   * The refiner option value
   */
  key: string;
  /**
   * The number of results that match this value
   */
  count: number;
}

export interface SearchIndex extends IndexConfig {
  value?: {
    [key: string]: number[];
  };
  sortedKeys?: any[];
  sortedIds?: number[];
}

/** The shape of an Index registration */
export interface IndexConfig {
  /**
   * Unique identifier for the index.
   * If no "path" is provided, it is assumed the "key" matches the
   * property name on the item.
   */
  key: string;
  /** String, Number, Date, etc... */
  type: IndexType;
  /**
   * If the key doesn't match the item's property name, use path.
   * Allows nested paths like "author.name"
   */
  path?: string;
  /**
   * For things like dates with timestamps, or really long strings,
   * do you really need to calculate refiner option?
   */
  skipRefinerOptions?: boolean;
  /**
   * A convenience property so you can build dynammic controls like
   * a "Sort Options Dropwdown"
   */
  label?: string;
}

export interface QueryCriteria {
  /**
   * An object where each property matches an index key
   */
  filter?: Filter;
  /**
   * The index key to sort by
   */
  sort?: string;
  /**
   * The sort direction
   */
  sortDir?: "asc" | "desc";
  /**
   * The max number of matching results to return
   */
  limit?: number;
  /**
   * Pair with 'limit' to implement paging
   */
  skip?: number;
}

export interface IndexFilterResult {
  indexKey: string;
  key: string;
  matches: number[];
}

export interface PersistedQueryResult {
  /**
   * The serialized criteria
   */
  key: string;
  /**
   * An array of Ids for the items that match the criteria.
   * If you already have the full items array in memory, you can
   * use that and improve performance with 'skipHydrateItems'
   */
  itemIds: string[] | number[];
  /**
   * An op
   */
  refiners: {
    /**
     * Each property will map to a registered index.
     */
    [key: string]: RefinerOption[];
  };
  /**
   * Totol number of results regardless of 'limit'
   */
  totalCount: number;
  /**
   * The timestamp when the query was executed
   */
  timestamp: number;
}

/**
 * The result of a query that include things like the
 * matched items and dynamic refiner options.
 */
export interface QueryResult<T = any> extends PersistedQueryResult {
  items?: T[];
}

export type DBItem =
  | {
      id: string | number;
    }
  | { key: string | number };

export type PersistedStoreCollections = {
  allItems: PersistedCollection;
  filterResults: PersistedCollection<IndexFilterResult>;
  queryResults: PersistedCollection<PersistedQueryResult>;
  indexes: PersistedCollection<SearchIndex>;
};

export type QueryParams = {
  indexRegistrations: IndexConfig[];
  criteria: QueryCriteria;
  queryId?: number;
};

export interface ReindexParams {
  indexingId?: number;
  indexRegistrations: IndexConfig[];
}

export type PersistedStoreMethods = {
  query: (params: QueryParams) => Promise<PersistedQueryResult>;
  reindex: (params: ReindexParams) => Promise<void>;
  setItems: (items: any[]) => Promise<void>;
  pushItems: (items: any[]) => Promise<void>;
  destroy: () => Promise<void>;
};

export type PersistedStore = PersistedStoreCollections & PersistedStoreMethods;

export interface PersistedCollection<T extends DBItem = any> {
  /** Clear all rows in the table */
  clear: () => Promise<void>;
  /** Get a row by primary key */
  get: (key: string | number) => Promise<T>;
  /** Get the total number of items */
  count: () => Promise<number>;
  /** Put an item into the collection */
  put: (item: T) => Promise<any>;
  /** Loop through all rows in the table */
  each: (callback: (row: T, { primaryKey }) => void) => Promise<void>;
  /** Replace all the items in the collection */
  bulkAdd: (items: any[]) => Promise<any>;
  /** Ins */
  bulkPut: (items: T[]) => Promise<void>;
  /** Get a bunch of items by IDs */
  bulkGet: (keys: string[] | number[]) => Promise<T[]>;
}
