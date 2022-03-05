import {
  IndexFilterResult,
  PersistedQueryResult,
  PersistedStoreCollections,
  QueryParams,
  SearchIndex,
} from "../..";
import createMeasurement from "../../utils/utils";
import { getIndexFilterResults } from "./getIndexFilterResults";
import { getPagedSortedItemIds } from "./getPagedSortedItemIds";
import { getRefiners } from "./getRefiners";

let activeQueryId = -1;

const query = async (
  store: PersistedStoreCollections,
  { indexRegistrations, criteria, queryId }: QueryParams
): Promise<PersistedQueryResult> => {
  activeQueryId = queryId;
  let criteriaKey = JSON.stringify(criteria);

  // First check to see if there is a match
  // TODO: can we move this up?
  // Should we move the get filter results into the same transaction?
  let persistedQueryResult: PersistedQueryResult = (await store.queryResults.get(
    criteriaKey
  )) as any;

  if (!persistedQueryResult) {
    let allIndexes: SearchIndex[] = (
      await store.indexes.bulkGet(indexRegistrations.map((index) => index.key))
    ).filter(Boolean) as any;

    if (!allIndexes || !allIndexes.length) {
      // db.stateMachine.send(IndexEvent.INVALIDATE);
      throw { messsage: "No indexes found", type: "abort" };
    }

    // throw { message: "custom", type: "abort" };
    // Check for a stale query id after every async activity
    if (activeQueryId !== queryId) {
      throw { messsage: "Stale queryId indexing", type: "abort" };
    }

    // GET INDEX FILTER RESULTS
    let filtersMeasure = createMeasurement(`${queryId}:filters`);
    filtersMeasure.start();
    // Get an array of arrays. where we store a set of itemId matches for each filter
    let indexFilterResults: IndexFilterResult[] = await getIndexFilterResults(
      indexRegistrations,
      criteria.filter,
      store.filterResults as any,
      allIndexes
    );
    filtersMeasure.stop();

    // Check for a stale query id after every async activity
    if (activeQueryId !== queryId) {
      throw { messsage: "Stale queryId filtering", type: "abort" };
    }

    /** Start Refiners */
    let refinersMeasure = createMeasurement(`${queryId}:refiners`);
    refinersMeasure.start();

    let refiners = getRefiners(indexRegistrations, allIndexes, indexFilterResults);

    refinersMeasure.stop();

    /** End Refiners */

    /** Calculate the ordered itemIds */
    let intersectionMeasure = createMeasurement(`${queryId}:sortedItemIds`);
    intersectionMeasure.start();

    let { trimmedIds, totalCount } = getPagedSortedItemIds(
      indexFilterResults,
      criteria,
      indexRegistrations
    );
    intersectionMeasure.stop();

    persistedQueryResult = {
      itemIds: trimmedIds,
      refiners,
      totalCount: totalCount,
      key: criteriaKey,
      timestamp: Date.now(),
      queryId: queryId,
    };
    persistedQueryResult = await store.queryResults.put(persistedQueryResult);

    // Check for a stale query id after every async activity
    if (activeQueryId !== queryId) {
      throw { messsage: "Stale queryId saving persistedQueryResult", type: "abort" };
    }
    return persistedQueryResult;
    // Check for a stale query id after every async activity
  }

  return persistedQueryResult;
};

export default query;
