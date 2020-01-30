import RefinerDB from "../RefinerDB";
import { SearchIndex } from "..";
import { indexers } from "../helpers/indexers";
import Dexie from "dexie";
import omit from "lodash/omit";
import { IndexType } from "../interfaces";
import createMeasurement from "../utils/utils";

let activeQueryId = -1;

export default async function reindex(db: RefinerDB, queryId = Date.now()) {
  activeQueryId = queryId;
  let measurement = createMeasurement("Reindexing" + Date.now());
  measurement.start();
  return db.transaction("rw", db.allItems, db.indexes, db.filterResults, db.queryResults, () => {
    db.filterResults.clear();
    db.queryResults.clear();
    let indexes: SearchIndex[] = db._indexRegistrations.map((index) => {
      return {
        ...index,
        value: {},
        sortedKeys: [],
      };
    });
    // Loop through each items
    db.allItems
      .each((item, { primaryKey }) => {
        db._indexRegistrations.forEach((indexDefinition, i) => {
          let indexer = indexers[indexDefinition.type];
          if (indexer) {
            indexer(item, primaryKey, indexes[i]);
          }
        });
      })
      .then(() => {
        if (activeQueryId === queryId) {
          indexes.forEach((index) => {
            if (index.type === IndexType.Number) {
              index.sortedKeys = index.sortedKeys.sort((a, b) => a - b);
            } else {
              index.sortedKeys = index.sortedKeys.sort();
            }
            // console.log("PUTTING", index.key);
            db.indexes.put(index);
          });
        }
      });
    if (activeQueryId !== queryId) {
      console.log("ABORTING REINDEX TRANSACTION");
      Dexie.currentTransaction.abort();
    }
    measurement.stop();
  });
}
