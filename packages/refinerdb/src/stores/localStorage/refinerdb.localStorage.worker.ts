import * as Comlink from "comlink";
import type { QueryParams, ReindexParams } from "../..";
import { LocalStorageStore } from "./LocalStorageStore";

export function setupLocalStorageWorker() {
  const worker = {
    reindex(dbName, idProperty, params: ReindexParams) {
      let store = new LocalStorageStore(dbName, idProperty);
      console.log("WORKER: Local Storage reindexing", params.indexRegistrations);
      return store.reindex(params);
    },
    async query(dbName, idProperty, params: QueryParams) {
      let store = new LocalStorageStore(dbName, idProperty);
      console.log("WORKER: Local Storage query", params.indexRegistrations, params.criteria);
      return store.query(params);
    },
  };
  Comlink.expose(worker);
}

if (window != self) {
  setupLocalStorageWorker();
}
