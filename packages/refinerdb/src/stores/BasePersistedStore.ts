import {
  IndexFilterResult,
  PersistedCollection,
  PersistedStoreCollections,
  QueryResult,
  SearchIndex,
} from "..";

export abstract class BasePersistedStore implements PersistedStoreCollections {
  allItems: PersistedCollection;
  indexes: PersistedCollection<SearchIndex>;
  filterResults: PersistedCollection<IndexFilterResult>;
  queryResults: PersistedCollection<QueryResult>;
}
