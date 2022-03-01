import {
  IndexFilterResult,
  PersistedCollection,
  PersistedQueryResult,
  PersistedStoreCollections,
  QueryParams,
  ReindexParams,
  SearchIndex,
} from "..";
import { indexItems } from "../transactions/indexItems";
import _query from "../transactions/query/query";

/** An abstract base class for all Persisted Store impelementation to inherit from */
export abstract class BasePersistedStore implements PersistedStoreCollections {
  protected dbName: string;
  protected worker = null;
  protected idProperty: string;
  allItems: PersistedCollection;
  indexes: PersistedCollection<SearchIndex>;
  filterResults: PersistedCollection<IndexFilterResult>;
  queryResults: PersistedCollection<PersistedQueryResult>;

  setItems = async (items: any[]) => {
    await Promise.all([
      this.indexes.clear(),
      this.filterResults.clear(),
      this.allItems.clear(),
      this.queryResults.clear(),
    ]);
    await this.allItems.bulkAdd(items);
  };

  pushItems = async (items: any[]) => {
    await Promise.all([
      this.indexes.clear(),
      this.filterResults.clear(),
      this.queryResults.clear(),
    ]);
    await this.allItems.bulkPut(items);
  };

  query = async (params: QueryParams): Promise<PersistedQueryResult> => {
    if (this.worker) {
      this.worker.query(this.dbName, this.idProperty, params);
    } else {
      return _query(this, params);
    }
  };

  reindex = async (params: ReindexParams) => {
    if (this.worker) {
      await this.worker.reindex(this.dbName, this.idProperty, params);
    } else {
      this.filterResults.clear();
      this.queryResults.clear();
      this.indexes.clear();
      await indexItems(this, params);
    }
  };
}
