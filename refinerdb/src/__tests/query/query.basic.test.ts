import RefinerDb, {
  IndexType,
  RefinerDBConfig,
  IndexState,
  IndexConfig,
  SearchIndex,
} from "../../index";

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

describe("Querying - Basic", () => {
  let search = new RefinerDb("test-querying");
  search.setIndexes(indexDefinitions);

  it("Should return the correct item with a single exact equals string filter", async () => {
    search.setCriteria({ filter: { title: "two" } });
    search.setItems(items);
    let result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("two");
  });

  it("Should wait for a reIndex", async () => {
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

  it("Should return results with items missing an index property if that index is not in the filter", () => {});
});
