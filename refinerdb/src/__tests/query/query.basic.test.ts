import RefinerDb, {
  IndexType,
  RefinerDBConfig,
  IndexState,
  IndexConfig,
  SearchIndex,
} from "../../index";
import RefinerDB from "../../index";

let items = [
  { title: "one", id: 1, category: "odd" },
  { title: "two", id: 2, category: "even" },
  // Deliberately omitting category property
  { title: "four", id: 4 },
  { title: "three", id: 3, category: "odd" },
  { title: "one", id: 11, category: "odd" },
];

let indexDefinitions: IndexConfig[] = [
  { key: "title", type: IndexType.String },
  { key: "id", type: IndexType.Number },
  { key: "category", type: IndexType.String },
];

describe("Querying - Basic", () => {
  let search: RefinerDB;
  beforeEach(() => {
    search = new RefinerDb("test-querying");
    search.setIndexes(indexDefinitions);
  });

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

  it("Should return items missing an index property if that index is not in the filter", async () => {
    search.setItems(items);
    let result = await search.getQueryResult();
    // There is no filter, so everything should be included
    expect(result.items.length).toBe(items.length);
  });

  it("Should not return items missing an index property if that index is in the filter", async () => {
    search.setItems(items);
    search.setCriteria({ filter: { category: "odd" } });
    let result = await search.getQueryResult();
    let oddItems = items.filter((item) => item.category === "odd");
    expect(result.items.length).toBe(oddItems.length);
  });
});
