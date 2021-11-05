import { PersistedCollection } from "../..";

export class LocalStorageCollection<T = any> implements PersistedCollection {
  key = "";
  name = "";
  idProperty = "id";
  constructor(dbName, collectionName, idProperty = "id") {
    this.key = `${dbName}-${collectionName}`;
    this.name = collectionName;
    this.idProperty = idProperty;
  }

  clear = async () => {
    localStorage.removeItem(this.key);
  };
  private getAllItems = () => {
    try {
      let items = JSON.parse(localStorage.getItem(this.key));
      return items;
    } catch (err) {
      return null;
    }
  };
  private setAllItems = (items: any[]) => {
    localStorage.setItem(this.key, JSON.stringify(items));
  };
  get = async (id: string | number) => {
    let items = this.getAllItems();
    return items?.find?.((item) => item[this.idProperty] === id);
  };
  put = async (item: any) => {
    let items = this.getAllItems();
    if (!items) {
      items = [];
    }
    items.push(item);
    this.setAllItems(items);
  };
  count = async () => {
    return this.getAllItems()?.length || 0;
  };
  each = async (callback: (item, extra) => void) => {
    let items = this.getAllItems();
    items?.forEach?.((item) => callback(item, { primaryKey: item[this.idProperty] }));
  };
  bulkAdd = async (items: any[]) => {
    this.setAllItems(items);
  };
  bulkPut = async (items: any[]) => {
    let existingItems = this.getAllItems() || [];
    let newItems = [...existingItems, ...items];
    this.setAllItems(newItems);
  };
  bulkGet = async (ids: string[] | number[]) => {
    let items = this.getAllItems();
    return items.filter((item: any) => {
      return (ids as any).includes(item[this.idProperty]);
    });
  };
}
