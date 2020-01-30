import RefinerDb, {
  IndexType,
  RefinerDBConfig,
  IndexState,
  IndexConfig,
  SearchIndex,
} from "../index";

describe("Constructor", () => {
  it("Should setup the proper data stores", () => {
    let search = new RefinerDb("test-db");
    expect(search.table("allItems")).toBeTruthy();
    expect(search.table("indexes")).toBeTruthy();
    expect(search.table("filterResults")).toBeTruthy();
    try {
      search.table("INIDLE_TABLE");
      expect("INVALID TABLE NAME").toBe("SHOULD HAVE THROWN");
    } catch (err) {
      // this should have happened
    }
  });

  it("Should respect the passed in SearchIndexerConfig", () => {
    let config: RefinerDBConfig = {
      indexDelay: 500,
    };
    let search = new RefinerDb("test-db2", config);
    expect(search.config.indexDelay).toBe(config.indexDelay);
  });

  it("Should setup the state machine", () => {
    let search = new RefinerDb("test-db");
    expect(search.getIndexState()).toBe(IndexState.IDLE);
  });
});

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

describe("Set Indexes", () => {
  it("Should go to stale if there are new indexes being set", async () => {
    let search = new RefinerDb("test-indexes", { indexDelay: 200 });
    expect(search.getIndexState()).toBe(IndexState.IDLE);
    search.setIndexes(indexDefinitions);
    await wait(100);
    expect(search.getIndexState()).toBe(IndexState.STALE);
  });

  it("Should NOT go stale if you repeatedly set the same indexes", async () => {
    let search = new RefinerDb("test-indexes-2", { indexDelay: 200 });
    expect(search.getIndexState()).toBe(IndexState.IDLE);
    search.setIndexes(indexDefinitions);
    await wait(100);
    expect(search.getIndexState()).toBe(IndexState.STALE);
    await wait(300);
    expect(search.getIndexState()).toBe(IndexState.IDLE);
    search.setIndexes(indexDefinitions);
    expect(search.getIndexState()).toBe(IndexState.IDLE);
  });
});

describe("Auto Indexing", () => {
  let search: RefinerDb;

  beforeEach(async () => {});

  it("Should automatically reindex when new items are added", async () => {
    search = new RefinerDb("test-auto-indexing", { indexDelay: 300 });
    let titleIndex = await search.indexes.get("title");
    let idIndex = await search.indexes.get("id");
    expect(titleIndex).toBeFalsy();
    expect(idIndex).toBeFalsy();

    search.setIndexes(indexDefinitions);
    await wait(600);

    return new Promise(async (resolve) => {
      //   expect(reindexSpy).toHaveBeenCalledTimes(0);
      expect(search.getIndexState()).toBe(IndexState.IDLE);
      await search.setItems(items);
      expect(search.getIndexState()).toBe(IndexState.STALE);

      // Wait for the auto index
      setTimeout(async () => {
        titleIndex = await search.indexes.get("title");
        idIndex = await search.indexes.get("id");

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

describe("Set Criteria", () => {
  // TODO: Test setCriteria
});

function wait(delay: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), delay);
  });
}
