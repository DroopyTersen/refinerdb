import movies from "../fixtures/movies";
import RefinerDB from "../..";
import { IndexConfig, IndexType, QueryResult } from "../../interfaces";
import { type } from "os";

let items = [
  { title: "three", id: 3, color: "orange" },
  { title: "two", id: 2, color: "blue" },
  { title: "one", id: 1, color: "red" },
  { title: "four", id: 4, color: "purple" },
];
let indexDefinitions: IndexConfig[] = [
  { key: "title", type: IndexType.String },
  { key: "id", type: IndexType.Number },
  { key: "color", type: IndexType.String },
];

describe("Sorting - Basic", () => {
  let search = new RefinerDB("test-sorting");
  search.setIndexes(indexDefinitions);

  it("Should return all items if there is no filter", async () => {
    search.setItems(items);
    search.setCriteria({ limit: 100 });
    let result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(items.length);
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
});
