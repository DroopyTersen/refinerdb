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

describe("Set Items", function() {
  let search = new RefinerDb("test-items");
  search.setIndexes(indexDefinitions);

  beforeAll(async () => {
    await search.setItems(items);
  });

  it("Should store the items", async () => {
    let count = await search.allItems.count();
    expect(count).toBe(items.length);
    let itemTwo = await search.allItems.get(2);
    expect(itemTwo).toBeTruthy();
    expect(itemTwo).toHaveProperty("title");

    expect(itemTwo.title).toBe("two");
  });

  it("Should mark the index as stale", () => {
    let indexState = search.getIndexState();
    expect(indexState).toBe(IndexState.STALE);
  });

  it("Should completely replace existing items", async () => {
    let count = await search.allItems.count();
    expect(count).toBe(items.length);
    await search.setItems(items);
    count = await search.allItems.count();
    expect(count).toBe(items.length);
  });
});
