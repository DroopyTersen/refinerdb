import { LocalStorageCollection } from "../../stores/localStorage/LocalStorageCollection";
import { resetMockStorage, setupMockStorageApis, teardownMockStorageApis } from "../storageMocks";

describe("LocalStorageCollection", () => {
  beforeAll(() => {
    setupMockStorageApis();
  });

  afterEach(() => {
    resetMockStorage();
  });

  describe("Constructor", () => {
    it("Should create an instance with methods that match the IPersistedCollection interface", () => {
      let collection = new LocalStorageCollection("testDB", "testCollection");
      expect(collection).toBeTruthy();
      expect(collection).toHaveProperty("get");
      expect(collection).toHaveProperty("each");
      expect(collection).toHaveProperty("put");
      expect(collection).toHaveProperty("count");
    });
  });

  describe("Save and retreive an item by ID", () => {
    it("Should store an item the retrieve it using the default idProperty as a number.", async () => {
      let collection = new LocalStorageCollection("testDB", "testCollection");
      let item = { id: 1, name: "one" };
      let item2 = { id: 2, name: "two" };
      await collection.put(item);
      await collection.put(item2);
      let fetchedItem1 = await collection.get(item.id);
      let fetchedItem2 = await collection.get(item2.id);
      expect(fetchedItem1).toBeTruthy();
      expect(fetchedItem1.id).toEqual(item.id);
      expect(fetchedItem2).toBeTruthy();
      expect(fetchedItem2.id).toEqual(item2.id);
    });

    it("Should store an item the retrieve it using the default idProperty as a string.", async () => {
      let collection = new LocalStorageCollection("testDB", "testCollection");
      let item = { id: "123", name: "one" };
      let item2 = { id: "456", name: "two" };
      await collection.put(item);
      await collection.put(item2);
      let fetchedItem1 = await collection.get(item.id);
      let fetchedItem2 = await collection.get(item2.id);
      expect(fetchedItem1).toBeTruthy();
      expect(fetchedItem1.id).toEqual(item.id);
      expect(fetchedItem2).toBeTruthy();
      expect(fetchedItem2.id).toEqual(item2.id);
    });

    it("Should allow specifying a custom 'idProperty'", async () => {
      let collection = new LocalStorageCollection("testDB", "testCollection", "_id");
      console.log(collection.idProperty);
      let item = { _id: "123", name: "one" };
      let item2 = { _id: "456", name: "two" };
      await collection.put(item);
      await collection.put(item2);
      let fetchedItem1 = await collection.get(item._id);
      let fetchedItem2 = await collection.get(item2._id);
      expect(fetchedItem1).toBeTruthy();
      expect(fetchedItem1._id).toEqual(item._id);
      expect(fetchedItem2).toBeTruthy();
      expect(fetchedItem2._id).toEqual(item2._id);
    });
  });

  afterAll(() => {
    teardownMockStorageApis();
  });
});
