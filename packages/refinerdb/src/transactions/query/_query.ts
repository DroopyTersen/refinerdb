import RefinerDB, { IndexFilterResult, QueryResult, SearchIndex } from "../..";
import createMeasurement from "../../utils/utils";
import { getIndexFilterResults } from "./getIndexFilterResults";
import { getPagedSortedItemIds } from "./getPagedSortedItemIds";
import { getRefiners } from "./getRefiners";

let activeQueryId = -1;

const _query = async (db: RefinerDB, queryId: number = Date.now()): Promise<QueryResult> => {
  activeQueryId = queryId;
  let criteriaKey = db.getCriteriaKey();
  let result: QueryResult = null;

  // First check to see if there is a match
  // TODO: can we move this up?
  // Should we move the get filter results into the same transaction?
  let cachedResult = (await db.queryResults.get(criteriaKey)) as any;
  if (cachedResult) {
    return cachedResult as QueryResult;
  }

  let allIndexes: SearchIndex[] = (
    await db.indexes.bulkGet(db._indexRegistrations.map((index) => index.key))
  ).filter(Boolean) as any;

  if (!allIndexes || !allIndexes.length) {
    // db.stateMachine.send(IndexEvent.INVALIDATE);
    return Promise.resolve(null);
  }

  // Check for a stale query id after every async activity
  if (activeQueryId !== queryId) return;

  // GET INDEX FILTER RESULTS
  let filtersMeasure = createMeasurement("query:filters" + queryId);
  filtersMeasure.start();
  // Get an array of arrays. where we store a set of itemId matches for each filter
  let indexFilterResults: IndexFilterResult[] = await getIndexFilterResults(
    db._indexRegistrations,
    db._criteria.filter,
    db.filterResults as any,
    allIndexes
  );
  filtersMeasure.stop();

  // Check for a stale query id after every async activity
  if (activeQueryId !== queryId) return;

  /** Start Refiners */
  let refinersMeasure = createMeasurement("query:refiners" + queryId);
  refinersMeasure.start();

  let refiners = getRefiners(db._indexRegistrations, allIndexes, indexFilterResults);

  refinersMeasure.stop();

  /** End Refiners */

  /** Calculate the ordered itemIds */
  let intersectionMeasure = createMeasurement("query:intersection" + queryId);
  intersectionMeasure.start();

  let { trimmedIds, totalCount } = getPagedSortedItemIds(
    indexFilterResults,
    db._criteria,
    db._indexRegistrations
  );
  intersectionMeasure.stop();

  let hydrateItemsMeasurement = createMeasurement("query:hydrateItems" + queryId);
  hydrateItemsMeasurement.start();
  // Hydrate the items based in the array of itemIds
  let items = await db.allItems.bulkGet(trimmedIds);
  hydrateItemsMeasurement.stop();

  // Check for a stale query id after every async activity
  if (activeQueryId !== queryId) return;

  result = {
    items,
    refiners,
    totalCount: totalCount,
    key: criteriaKey,
    timestamp: Date.now(),
  };
  await db.queryResults.put(result);

  // Check for a stale query id after every async activity
  if (activeQueryId !== queryId) return;

  return result;
};

export default _query;
