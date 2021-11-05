import RefinerDB from "../..";
import { cloneBasicItems } from "../fixtures/basicItems";

let basicItems = cloneBasicItems();
let items = JSON.parse(JSON.stringify(basicItems.items));
let indexDefinitions = JSON.parse(JSON.stringify(basicItems.indexDefinitions));

describe.only("Querying - Basic", () => {
  let search: RefinerDB;
  beforeAll(async () => {
    search = new RefinerDB("test-sorting");
    search.setIndexes(indexDefinitions);
  });

  it("Should return items with an 'id' property if the original item had an 'id'", async () => {
    search.setItems(items);
    search.setCriteria({ limit: 100 });
    let result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("items");
    expect(result.items).toHaveLength(items.length);
    expect(result.items[0]).toHaveProperty("id");
  });

  it("Should be able to return queryResult from cache if same criteriaKey", async () => {
    search.setItems(items);
    search.setCriteria({ limit: 100 });
    let result = await search.getQueryResult();
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("timestamp");
    let prevTimestamp = result.timestamp;

    search.setCriteria({ limit: 100 });
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
});
