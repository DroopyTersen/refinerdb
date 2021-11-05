import { IndexConfig, PersistedStore, SearchIndex } from "../..";
import { indexers } from "../../helpers/indexers";

let activeQueryId = -1;

export const _reindex = async (
  store: PersistedStore,
  indexRegistrations: IndexConfig[],
  queryId = Date.now()
): Promise<boolean> => {
  activeQueryId = queryId;
  store.filterResults.clear();
  store.queryResults.clear();

  let indexes: SearchIndex[] = indexRegistrations.map((indexRegistration) => {
    return {
      ...indexRegistration,
      value: {},
      sortedKeys: [],
      sortedIds: [],
    };
  });

  await store.allItems.each((item, { primaryKey }) => {
    indexRegistrations.forEach((indexDefinition, i) => {
      let indexer = indexers[indexDefinition.type];
      if (indexer) {
        indexer(item, primaryKey, indexes[i]);
      }
    });
  });

  if (activeQueryId !== queryId) {
    return false;
  }
};
