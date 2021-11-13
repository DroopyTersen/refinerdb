/**
 * @jest-environment jsdom
 */

import {
  RefinerDB,
  IndexType,
  RefinerDBConfig,
  IndexState,
  IndexConfig,
  SearchIndex,
} from "../index";
import { resetMockStorage, setupMockStorageApis, teardownMockStorageApis } from "./storageMocks";

let items = [
  { title: "one", id: 1 },
  { title: "two", id: 2 },
  { title: "four", id: 4 },
  { title: "three", id: 3 },
  { title: "one", id: 11 },
];

let indexDefinitions: IndexConfig[] = [
  { key: "title", type: IndexType.String },
  { key: "id", type: IndexType.Number },
];
describe("RefinerDB", () => {
  beforeAll(() => {
    setupMockStorageApis();
  });

  afterEach(() => {
    resetMockStorage();
  });

  describe("Constructor", () => {
    it("Should setup the proper data stores", () => {
      let search = new RefinerDB("test-db");
      expect(search._store.allItems).toBeTruthy();
      expect(search._store.filterResults).toBeTruthy();
      expect(search._store.queryResults).toBeTruthy();
      expect(search._store.indexes).toBeTruthy();
    });

    it("Should respect the passed in SearchIndexerConfig", () => {
      let config: RefinerDBConfig = {
        indexDelay: 500,
      };
      let search = new RefinerDB("test-db2", config);
      expect(search.config.indexDelay).toBe(config.indexDelay);
    });

    it("Should setup the state machine", () => {
      let search = new RefinerDB("test-db");
      expect(search.getIndexState()).toBe(IndexState.IDLE);
    });
  });

  describe("Set Indexes", () => {
    it("Should go to stale if there are new indexes being set", async () => {
      let search = new RefinerDB("test-indexes", { indexDelay: 200 });
      expect(search.getIndexState()).toBe(IndexState.IDLE);
      search.setIndexes(indexDefinitions);
      await wait(100);
      expect(search.getIndexState()).toBe(IndexState.STALE);
    });

    it("Should NOT go stale if you repeatedly set the same indexes", async () => {
      let search = new RefinerDB("test-indexes-2", { indexDelay: 200 });
      expect(search.getIndexState()).toBe(IndexState.IDLE);
      search.setIndexes(indexDefinitions);
      await wait(100);
      expect(search.getIndexState()).toBe(IndexState.STALE);
      await search.waitForState(IndexState.IDLE);
      expect(search.getIndexState()).toBe(IndexState.IDLE);
      search.setIndexes(indexDefinitions);
      expect(search.getIndexState()).toBe(IndexState.IDLE);
    });
  });

  describe("Set Items", function () {
    let search: RefinerDB = null;
    beforeAll(async () => {
      search = new RefinerDB("test-items");
      search.setIndexes(indexDefinitions);
      await search.setItems(items);
    });

    it("Should store the items", async () => {
      let count = await search._store.allItems.count();
      expect(count).toBe(items.length);
      let itemTwo = await search._store.allItems.get(2);
      expect(itemTwo).toBeTruthy();
      expect(itemTwo).toHaveProperty("title");

      expect(itemTwo.title).toBe("two");
    });

    it("Should mark the index as stale", () => {
      let indexState = search.getIndexState();
      expect(indexState).toBe(IndexState.STALE);
    });
  });

  describe("ReIndexing", () => {
    let search: RefinerDB = null;
    let titleIndex: SearchIndex;
    let idIndex: SearchIndex;

    beforeAll(async () => {
      search = new RefinerDB("test-indexing");
      search.setIndexes(indexDefinitions);
      await search.setItems(items);
      await search.reindex();
      titleIndex = await search._store.indexes.get("title");
      idIndex = await search._store.indexes.get("id");
    });

    it("Should create a SearchIndex in the indexes store for each registered indexDefinition", async () => {
      expect(titleIndex).toBeTruthy();
      expect(titleIndex).toHaveProperty("key");
      expect(titleIndex).toHaveProperty("value");
      expect(titleIndex).toHaveProperty("sortedKeys");
      expect(titleIndex.key).toBe("title");
      expect(idIndex).toBeTruthy();
      expect(idIndex).toHaveProperty("key");
      expect(idIndex).toHaveProperty("sortedKeys");
    });

    it("Should setup the index hash map", () => {
      expect(titleIndex).toHaveProperty("value");
      expect(titleIndex.value).toHaveProperty("one");
      expect(titleIndex.value["one"]).toHaveLength(2);
    });

    it("Should setup the sortedKeys", () => {
      expect(idIndex.sortedKeys).toHaveLength(items.length);
      expect(idIndex.sortedKeys[0]).toBeLessThanOrEqual(
        idIndex.sortedKeys[idIndex.sortedKeys.length - 1]
      );
    });

    it("Should set the IndexState to IDLE", () => {
      expect(search.getIndexState()).toBe(IndexState.IDLE);
    });

    it("Should clear the queryResults", () => {});
  });

  describe("Auto Indexing", () => {
    let search: RefinerDB;

    beforeEach(async () => {});

    it("Should automatically reindex when new items are added", async () => {
      search = new RefinerDB("test-auto-indexing", { indexDelay: 300 });
      let titleIndex = await search._store.indexes.get("title");
      let idIndex = await search._store.indexes.get("id");
      expect(titleIndex).toBeFalsy();
      expect(idIndex).toBeFalsy();

      search.setIndexes(indexDefinitions);
      await wait(600);

      return new Promise<void>(async (resolve) => {
        //   expect(reindexSpy).toHaveBeenCalledTimes(0);
        expect(search.getIndexState()).toBe(IndexState.IDLE);
        await search.setItems(items);
        expect(search.getIndexState()).toBe(IndexState.STALE);

        // Wait for the auto index
        setTimeout(async () => {
          titleIndex = await search._store.indexes.get("title");
          idIndex = await search._store.indexes.get("id");

          expect(search.getIndexState()).toBe(IndexState.IDLE);
          expect(titleIndex).toHaveProperty("value");
          expect(titleIndex.value).toHaveProperty("one");
          expect(titleIndex.value["one"]).toHaveLength(2);
          expect(idIndex.sortedKeys).toHaveLength(items.length);
          expect(idIndex.sortedKeys[0]).toBeLessThanOrEqual(
            idIndex.sortedKeys[idIndex.sortedKeys.length - 1]
          );
          resolve();
        }, 600);
      });
    });

    it("Should properly handle canceling a reIndex if new items get added mid Indexing", () => {});
  });

  describe("Querying - Basic", () => {
    it("Should return the correct item with a single exact equals string filter", async () => {
      let search = new RefinerDB("test-querying");
      search.setIndexes(indexDefinitions);
      search.setItems(items);
      search.setCriteria({ filter: { title: "two" } });
      let result = await search.getQueryResult();

      expect(result).toBeTruthy();
      expect(result).toHaveProperty("items");
      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe("two");
    });

    it("Should wait for a reIndex", async () => {
      let search = new RefinerDB("test-querying");
      search.setIndexes(indexDefinitions);
      search.setItems(items);
      search.setCriteria({ filter: { title: "two" } });
      expect(search.getIndexState()).toBe(IndexState.STALE);
      let result = await search.getQueryResult();

      expect(search.getIndexState()).toBe(IndexState.IDLE);
      expect(result).toBeTruthy();
      expect(result).toHaveProperty("items");
      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe("two");
    });
  });
  afterAll(() => {
    teardownMockStorageApis();
  });
});

function wait(delay: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), delay);
  });
}
