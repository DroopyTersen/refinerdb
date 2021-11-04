import RefinerDB from "../RefinerDB";

export function setItems(db: RefinerDB, items: any[]) {
  return db.transaction("rw", db.allItems, db.indexes, db.filterResults, db.queryResults, () => {
    // TODO: queryResults.clear() throws an error if there are none?
    // db.queryResults.clear();
    db.indexes.clear();
    db.filterResults.clear();
    db.allItems.clear();
    db.queryResults.clear();
    db.allItems.bulkAdd(items);
  });
}

export function pushItems(db: RefinerDB, items: any[]) {
  return db.transaction("rw", db.allItems, db.indexes, db.filterResults, db.queryResults, () => {
    // TODO: queryResults.clear() throws an error if there are none?
    // db.queryResults.clear();
    db.indexes.clear();
    db.filterResults.clear();
    db.allItems.clear();
    db.queryResults.clear();
    db.allItems.bulkPut(items);
  });
}
