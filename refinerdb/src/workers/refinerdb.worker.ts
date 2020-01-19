import RefinerDB from "../RefinerDB";
import reindex from "../transactions/reindex";
import { expose } from "threads/worker";
import { setItems } from "../transactions/setItems";

expose({
  reindex(dbName, indexes) {
    let refinerDB = new RefinerDB(dbName, { indexes, isWebWorker: true });
    console.log("WORKER: Reindexing", dbName);
    return reindex(refinerDB);
  },
  setItems(dbName, items) {
    let refinerDB = new RefinerDB(dbName, { isWebWorker: true });
    console.log("WORKER: Setting Items", dbName, items.length);
    setItems(refinerDB, items);
  },
});
