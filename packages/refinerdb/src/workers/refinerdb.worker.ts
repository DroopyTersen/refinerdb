import RefinerDB from "../RefinerDB";
import * as Comlink from "comlink";

const worker = {
  reindex(dbName, indexes) {
    let refinerDB = new RefinerDB(dbName, { indexes, isWebWorker: true });
    console.log("WORKER: Reindexing", dbName, refinerDB._indexRegistrations);
    return refinerDB.store.reindex({ indexRegistrations: refinerDB.indexRegistrations });
  },
  setItems(dbName, items) {
    let refinerDB = new RefinerDB(dbName, { isWebWorker: true });
    console.log("WORKER: Setting Items", dbName, items.length);
    refinerDB.store.setItems(items);
  },
  async query(dbName, indexes, criteria) {
    let refinerDB = new RefinerDB(dbName, { indexes, isWebWorker: true });
    refinerDB.setCriteria(criteria);
    let results = await refinerDB.getQueryResult();
    console.log("TCL: query -> results", results);
    return results;
  },
};
Comlink.expose(worker);
