import RefinerDb, {
  IndexType,
  RefinerDBConfig,
  IndexState,
  IndexConfig,
  SearchIndex,
} from "../../index";
import reindex from "../../transactions/reindex";
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

describe("ReIndexing", () => {
  let search = new RefinerDb("test-indexing");
  search.setIndexes(indexDefinitions);
  let titleIndex: SearchIndex;
  let idIndex: SearchIndex;

  beforeAll(async () => {
    await search.setItems(items);
    await search.reIndex();
    titleIndex = await search.indexes.get("title");
    idIndex = await search.indexes.get("id");
  });

  it("Should create a SearchIndex in the indexes store for each registered indexDefinition", () => {
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

  it("Should clear the cached queryResults and then requery", async () => {
    let queryResultsCount = await search.queryResults.count();
    // Part of getting to IDLE is requerying
    // which means there should be exactly cached query result
    expect(queryResultsCount).toBe(1);
  });
});
