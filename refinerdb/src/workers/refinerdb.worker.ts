import RefinerDB from "../RefinerDB";
import reindex from "../transactions/reindex";
import { expose } from "threads/worker";
import { setItems } from "../transactions/setItems";

expose({
  reindex(dbName, indexes) {
    let refinerDB = new RefinerDB(dbName, { indexes, isWebWorker: true });
    return reindex(refinerDB);
  },
  setItems(dbName, items) {
    let refinerDB = new RefinerDB(dbName, { isWebWorker: true });
    setItems(refinerDB, items);
  },
});
