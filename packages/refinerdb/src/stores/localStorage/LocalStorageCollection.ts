import { PersistedCollection } from "../..";
import createMeasurement from "../../utils/utils";

export class LocalStorageCollection implements PersistedCollection {
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

  private getItemsMap = () => {
    try {
      let itemsMap = JSON.parse(localStorage.getItem(this.key));
      return itemsMap;
    } catch (err) {
      return {};
    }
  };
  private getAllItems = () => {
    let itemsMap = this.getItemsMap() || {};
    return Object.values(itemsMap);
  };

  private setAllItems = (items: any[]) => {
    let objMap = items.reduce((map, item) => {
      map[item[this.idProperty]] = item;
      return map;
    }, {});
    localStorage.setItem(this.key, JSON.stringify(objMap));
  };

  get = async (id: string | number) => {
    let itemsMap = this.getItemsMap() || {};
    return itemsMap[id];
  };

  put = async (item: any) => {
    let itemsMap = this.getItemsMap() || {};
    itemsMap[item[this.idProperty]] = item;
    localStorage.setItem(this.key, JSON.stringify(itemsMap));
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
    let bulkGetMeasurement = createMeasurement("bulkGet Measurement");
    bulkGetMeasurement.start();
    let itemsMap = this.getItemsMap();
    bulkGetMeasurement.stop();
    return ids.map((id) => itemsMap[id]).filter(Boolean);
  };
}
