import { PersistedStoreCollections, ReindexParams, SearchIndex } from "..";
import { getSortedIds, indexers, NULL_HASH } from "../helpers/indexers";
import { IndexType } from "../interfaces";
import { serializeFunction } from "../utils/utils";

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
    .then(async () => {
      if (transactionId === indexingId) {
        // Finalize the indexes by sorting keys and ids to help optimize queries
        indexes.forEach((index) => {
          if (index.type === IndexType.Number) {
            index.sortedKeys = index.sortedKeys.sort((a, b) => {
              if (a === NULL_HASH) return 1;
              if (b === NULL_HASH) return -1;
              return a - b;
            });
          } else {
            index.sortedKeys = index.sortedKeys.sort();
          }

          index.sortedIds = Array.from(new Set(getSortedIds(index, [])));
        });
        // Persist the indexes
        await store.indexes.bulkPut(
          indexes.map((index) => {
            index.map = serializeFunction(index.map) as any;
            return index;
          })
        );
      } else {
        throw { message: "Indexing cancelled. Stale indexingId", type: "abort" };
      }
    })
    .catch((err) => {
      console.error("Indexing error", err);
      throw err;
    });
}
