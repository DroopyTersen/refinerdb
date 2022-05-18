import { RefinerDB } from "../..";
import { IndexType } from "../../interfaces";
import { cloneBasicItems } from "../fixtures/basicItems";
import { resetMockStorage, setupMockStorageApis, teardownMockStorageApis } from "../storageMocks";

let basicItems = cloneBasicItems();
let items = JSON.parse(JSON.stringify(basicItems.items));
let indexDefinitions = JSON.parse(JSON.stringify(basicItems.indexDefinitions));

describe("Querying - Basic", () => {
  let search: RefinerDB;

  beforeAll(async () => {
    setupMockStorageApis();
    search = new RefinerDB("test-sorting");
    search.setIndexes(indexDefinitions);
  });

  afterEach(() => {
    resetMockStorage();
  });

  it("Should return items with an 'id' property if the original item had an 'id'", async () => {
    await search.setItems(items);
    search.setCriteria({ limit: 100 });
    let result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(items.length);
    expect(result.items[0]).toHaveProperty("id");
  });

  it("Should be able to return queryResult from cache if same criteriaKey", async () => {
    await search.setItems(items);
    search.setCriteria({ limit: 100 });
    let result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("timestamp");
    let prevTimestamp = result.timestamp;

    result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("timestamp");
    expect(result.timestamp).toEqual(prevTimestamp);

    search.setCriteria({ limit: 100, sort: "color" });
    result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("timestamp");
    expect(result.timestamp).not.toEqual(prevTimestamp);
  });

  afterAll(() => {
    teardownMockStorageApis();
  });
});

describe("Querying - Invalid indexes", () => {
  beforeAll(async () => {
    setupMockStorageApis();
  });

  afterEach(() => {
    resetMockStorage();
  });

  it("Should handle a compound mapped index value", async () => {
    let search = new RefinerDB("test-sorting");
    let indexes = [
      ...indexDefinitions,
      { key: "color-title", type: IndexType.String, map: (item) => `${item.title}${item.color}` },
    ];
    search.setIndexes(indexes);
    await search.setItems(items);
    search.setCriteria({ limit: 100, filter: { "color-title": "onered" } });
    let result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toHaveProperty("id");
    expect(result.items[0]?.title).toBe("one");
  });

  afterAll(() => {
    teardownMockStorageApis();
  });
});

describe("Querying - Map fn index", () => {
  beforeAll(async () => {
    setupMockStorageApis();
  });

  afterEach(() => {
    resetMockStorage();
  });

  it("Should handle an invalid index.key", async () => {
    let search = new RefinerDB("test-sorting");
    let indexes = [...indexDefinitions, { key: "invalid", type: IndexType.String }];
    search.setIndexes(indexes);
    await search.setItems(items);
    search.setCriteria({ limit: 100 });
    let result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(items.length);
    expect(result.items[0]).toHaveProperty("id");
  });

  afterAll(() => {
    teardownMockStorageApis();
  });
});
