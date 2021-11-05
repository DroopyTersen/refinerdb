import { IndexConfig, PersistedStoreCollections, ReindexParams, SearchIndex } from "../..";
import { getSortedIds, indexers } from "../../helpers/indexers";
import { IndexType } from "../../interfaces";

let transactionId = -1;

export async function indexItems(
  store: PersistedStoreCollections,
  { indexRegistrations, indexingId }: ReindexParams
) {
  transactionId = indexingId;
  // Create index shell objects
  let indexes: SearchIndex[] = indexRegistrations.map((index) => {
    return {
      ...index,
      value: {},
      sortedKeys: [],
    };
  });
  // Loop through each item in the store
  return store.allItems
    .each((item, { primaryKey }) => {
      // Loop through each index and run the appropriate indexer
      indexRegistrations.forEach((indexDefinition, i) => {
        let indexer = indexers[indexDefinition.type];
        if (indexer) {
          // This will mutate the index
          indexer(item, primaryKey, indexes[i]);
        }
      });
    })
    .then(() => {
      if (transactionId === indexingId) {
        // Finalize the indexes by sorting keys and ids to help optimize queries
        indexes.forEach((index) => {
          if (index.type === IndexType.Number) {
            index.sortedKeys = index.sortedKeys.sort((a, b) => a - b);
          } else {
            index.sortedKeys = index.sortedKeys.sort();
          }
          index.sortedIds = Array.from(new Set(getSortedIds(index, [])));
        });
        // Persist the indexes
        store.indexes.bulkPut(indexes);
      }
    })
    .catch((err) => {
      console.error("Indexing error", err);
    });
}
