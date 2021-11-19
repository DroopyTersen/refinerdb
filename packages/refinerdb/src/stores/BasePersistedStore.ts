import {
  IndexFilterResult,
  PersistedCollection,
  PersistedQueryResult,
  PersistedStoreCollections,
  SearchIndex,
} from "..";

/** An abstract base class for all Persisted Store impelementation to inherit from */
export abstract class BasePersistedStore implements PersistedStoreCollections {
  allItems: PersistedCollection;
  indexes: PersistedCollection<SearchIndex>;
  filterResults: PersistedCollection<IndexFilterResult>;
  queryResults: PersistedCollection<PersistedQueryResult>;
}
