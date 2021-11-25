import { RefinerDB } from "../..";
import { cloneBasicItems } from "../fixtures/basicItems";
import { resetMockStorage, setupMockStorageApis, teardownMockStorageApis } from "../storageMocks";

let basicItems = cloneBasicItems();
let items = JSON.parse(JSON.stringify(basicItems.items));
let indexDefinitions = JSON.parse(JSON.stringify(basicItems.indexDefinitions));

describe("Sorting - Basic", () => {
  let search: RefinerDB;
  beforeAll(async () => {
    setupMockStorageApis();
    search = new RefinerDB("test-sorting");
    search.setIndexes(indexDefinitions);
  });

  afterEach(() => {
    resetMockStorage();
  });

  it("Should return all items if there is no filter", async () => {
    search.setItems(items);
    search.setCriteria({ limit: 100 });
    let result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(items.length);
  });

  // Assumes 'title' is the first index of `basicItems`
  it("Should sort by the first registered index if no specified filter", async () => {
    search.setItems(items);
    // clear out any sort
    search.setCriteria({ limit: 100 });
    let result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(items.length);
    expect(result.items[0].title).toBe("four");
  });

  it("Should sort by the specified key, with no filter", async () => {
    search.setItems(items);
    search.setCriteria({ sort: "title" });
    let result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(items.length);
    expect(result.items[0].title).toBe("four");

    search.setCriteria({ sort: "id", filter: { id: { min: 0 } } });
    result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(items.length);
    expect(result.items[0].id).toBe(1);
  });

  it("Should sort by the specified key, with a filter", async () => {
    search.setItems(items);
    search.setCriteria({ sort: "title", filter: { id: { min: 0 } } });
    let result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(items.length);
    expect(result.items[0].title).toBe("four");

    search.setCriteria({ sort: "id", filter: { id: { min: 0 } } });
    result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(items.length);
    expect(result.items[0].title).toBe("one");

    search.setCriteria({ sort: "color", filter: { id: { min: 0 } } });
    result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(items.length);
    expect(result.items[0].title).toBe("two");
  });

  it("Should support a sort direction", async () => {
    search.setItems(items);
    search.setCriteria({ sort: "title", sortDir: "desc", filter: { id: { min: 0 } } });
    let result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(items.length);
    expect(result.items[0].title).toBe("two");

    search.setCriteria({ sort: "id", sortDir: "desc", filter: { id: { min: 0 } } });
    result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(items.length);
    expect(result.items[0].title).toBe("four");

    search.setCriteria({ sort: "color", sortDir: "desc", filter: { id: { min: 0 } } });
    result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(items.length);
    expect(result.items[0].title).toBe("one");
  });

  it("Should support an invalid sort direction", async () => {
    search.setItems(items);
    search.setCriteria({ sort: "title", sortDir: "BLAH", filter: { id: { min: 0 } } } as any);
    let result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(items.length);
    expect(result.items[0].title).toBe("four");
  });

  it("Should support an invalid sort key", async () => {
    search.setItems(items);
    search.setCriteria({ sort: "BLAH", filter: { id: { min: 0 } } } as any);
    let result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(items.length);
    expect(result.items[0].title).toBe("four");
  });

  it("Should respect the limit and skip", async () => {
    search.setItems(items);
    search.setCriteria({ limit: 1, sort: "title", filter: {} });
    let result = await search.getQueryResult();
    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("four");
    search.setCriteria({ limit: 1, skip: 1, sort: "title", filter: {} });
    result = await search.getQueryResult();
    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("one");
  });

  afterAll(() => {
    teardownMockStorageApis();
  });
});
