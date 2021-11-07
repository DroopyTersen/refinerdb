import {
  IndexFilterResult,
  PersistedCollection,
  PersistedQueryResult,
  PersistedStoreCollections,
  SearchIndex,
} from "..";

export abstract class BasePersistedStore implements PersistedStoreCollections {
  allItems: PersistedCollection;
  indexes: PersistedCollection<SearchIndex>;
  filterResults: PersistedCollection<IndexFilterResult>;
  queryResults: PersistedCollection<PersistedQueryResult>;
}
