import { IndexedDBCollection } from "../../stores/idb";
import "../storageMocks";

const COLLECTION_NAME = "testCollection";
const DB_NAME = "testDB";
describe("IndexedDBCollection", () => {
  describe("Constructor", () => {
    it("Should create an instance with methods that match the IPersistedCollection interface", () => {
      let collection = new IndexedDBCollection(DB_NAME, COLLECTION_NAME);
      expect(collection).toBeTruthy();
      expect(collection).toHaveProperty("get");
      expect(collection).toHaveProperty("each");
      expect(collection).toHaveProperty("put");
      expect(collection).toHaveProperty("count");
    });
  });

  describe("Save and retreive an item by ID", () => {
    afterEach(() => {
      let collection = new IndexedDBCollection(DB_NAME, COLLECTION_NAME);
      collection.clear();
    });
    it("Should store an item the retrieve it using the default idProperty as a number.", async () => {
      let collection = new IndexedDBCollection(DB_NAME, COLLECTION_NAME);
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
      let collection = new IndexedDBCollection(DB_NAME, COLLECTION_NAME);
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
      let collection = new IndexedDBCollection(DB_NAME, COLLECTION_NAME, "_id");
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

  describe("Count", () => {
    it("Should return the correct count", async () => {
      let collection = new IndexedDBCollection(DB_NAME, COLLECTION_NAME);
      let item = { id: 1, name: "one" };
      let item2 = { id: 2, name: "two" };
      collection.put(item);
      collection.put(item2);
      let count = await collection.count();
      console.log("🚀 | it | count", count);
      expect(count).toEqual(2);
    });
  });

  describe("Each", () => {
    it("Should get called for each item", async () => {
      let ids = [];
      let collection = new IndexedDBCollection(DB_NAME, COLLECTION_NAME);
      let item = { id: 1, name: "one" };
      let item2 = { id: 2, name: "two" };
      collection.put(item);
      collection.put(item2);

      await collection.each((item) => {
        ids.push(item.id);
      });

      expect(ids).toHaveLength(2);
      expect(ids[0]).toEqual(1);
      expect(ids[1]).toEqual(2);
    });
  });

  describe("Bulk operations", () => {
    it("Should allow bulk inserts", async () => {
      let collection = new IndexedDBCollection(DB_NAME, COLLECTION_NAME);
      let items = [
        { id: 1, name: "one" },
        { id: 2, name: "two" },
        { id: 3, name: "three" },
      ];
      await collection.bulkAdd(items);
      let count = await collection.count();
      expect(count).toEqual(3);
    });

    it("Should allow bulk retrievals", async () => {
      let collection = new IndexedDBCollection(DB_NAME, COLLECTION_NAME);
      let items = [
        { id: 1, name: "one" },
        { id: 2, name: "two" },
        { id: 3, name: "three" },
      ];
      await collection.bulkAdd(items);
      let retrievedItems = await collection.bulkGet(items.map((item) => item.id));
      expect(retrievedItems.length).toEqual(items.length);
    });
  });
});
