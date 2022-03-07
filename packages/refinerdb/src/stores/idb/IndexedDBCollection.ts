import * as idb from "idb-keyval";
import { PersistedCollection } from "../..";
export class IndexedDBCollection implements PersistedCollection {
  key = "";
  name = "";
  idProperty = "id";
  idbStore: idb.UseStore = null;
  constructor(dbName, collectionName, idProperty = "id") {
    this.key = `${dbName}-${collectionName}`;
    this.name = collectionName;
    this.idProperty = idProperty;
    this.idbStore = idb.createStore(this.key, this.key);
  }

  clear = async () => {
    idb.clear(this.idbStore);
  };
  private toEntries = (items: any[]) => {
    let entries: [key: IDBValidKey, item: any][] = items.map((item) => [
      item[this.idProperty] as string | number,
      item,
    ]);
    return entries;
  };
  get = async (id: string | number) => {
    return idb.get(id, this.idbStore);
  };

  put = async (item: any) => {
    await idb.set(item[this.idProperty], item, this.idbStore);
    return item;
  };

  count = async () => {
    let allKeys = await idb.keys(this.idbStore);
    return allKeys?.length;
  };

  each = async (callback: (item, extra) => void) => {
    let items = await idb.values(this.idbStore);
    items?.forEach?.((item) => callback(item, { primaryKey: item[this.idProperty] }));
  };
  bulkAdd = async (items: any[]) => {
    await idb.clear(this.idbStore);

    await idb.setMany(this.toEntries(items), this.idbStore);
  };
  bulkPut = async (items: any[]) => {
    await idb.setMany(this.toEntries(items), this.idbStore);
  };
  bulkGet = async (ids: string[] | number[]) => {
    return idb.getMany(ids, this.idbStore);
  };
}
