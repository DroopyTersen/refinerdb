import RefinerDB, {
  QueryResult,
  SearchIndex,
  FilterResult,
  IndexConfig,
  Filter,
  PersistedCollection,
} from "..";
import { parseFilter, filterToString } from "../helpers/filterParser";
import { finders } from "../helpers/finders";
import intersection from "lodash/intersection";
import reverse from "lodash/reverse";
import createMeasurement from "../utils/utils";
let activeQueryId = -1;

async function getFilterResults(
  indexRegistrations: IndexConfig[],
  filter: Filter,
  persistedFilterResults: PersistedCollection<FilterResult>,
  allIndexes: SearchIndex[]
): Promise<FilterResult[]> {
  // Get an array of arrays. where we store a set of itemId matches for each filter
  let filters = parseFilter(filter);
  let filterResults: FilterResult[] = [];

  // Foreach index registration
  for (var i = 0; i < indexRegistrations.length; i++) {
    // Try to create a filter object from the active filters, otherwise
    // create an empty filter (that will return all items);
    let indexDefinition = indexRegistrations[i];
    let filter = filters.find((f) => f.indexKey === indexDefinition.key) || {
      indexKey: indexDefinition.key,
    };
    let filterKey = filterToString(filter);
    let matches = [];
    let cachedFilterResult = await persistedFilterResults.get(filterKey);

    if (cachedFilterResult && cachedFilterResult.matches) {
      matches = cachedFilterResult.matches;
    } else {
      // Query the index for any matches based on the active filter value
      matches = finders.findByIndexFilter(
        { indexDefinition, ...filter },
        allIndexes.find((i) => i.key === filter.indexKey)
      );
      // Cache the results for next time in case the filter key matches
      persistedFilterResults.put({ key: filterKey, matches, indexKey: filter.indexKey });
    }
    filterResults.push({
      indexKey: filter.indexKey,
      key: filterKey,
      matches,
    });
  }
  return filterResults;
}

const query = async (db: RefinerDB, queryId: number = Date.now()): Promise<QueryResult> => {
  activeQueryId = queryId;
  let result: QueryResult = null;

  let allIndexes: SearchIndex[] = (
    await db.indexes.bulkGet(db._indexRegistrations.map((index) => index.key))
  ).filter(Boolean) as any;

  if (!allIndexes || !allIndexes.length) {
    // db.stateMachine.send(IndexEvent.INVALIDATE);
    return Promise.resolve(null);
  }
  let filtersMeasure = createMeasurement("query:filters" + queryId);
  filtersMeasure.start();
  // Get an array of arrays. where we store a set of itemId matches for each filter
  let filterResults: FilterResult[] = await getFilterResults(
    db._indexRegistrations,
    db._criteria.filter,
    db.filterResults as any,
    allIndexes
  );
  filtersMeasure.stop();
  // Check for a stale query id after every async activity
  if (activeQueryId !== queryId) return;
  let criteriaKey = db.getCriteriaKey();
  await db.transaction(
    "rw",
    db.indexes,
    db.allItems,
    db.filterResults,
    db.queryResults,
    async () => {
      // First check to see if there is a match
      let cachedResult = (await db.queryResults.get(criteriaKey)) as any;
      if (cachedResult) {
        return cachedResult as QueryResult;
      }

      /** Start Refiners */
      let refinersMeasure = createMeasurement("query:refiners" + queryId);
      refinersMeasure.start();
      // console.log("TCL: filterResults", filterResults);
      let refiners = null;

      let allRefinerOptions = db._indexRegistrations.map((indexRegistration, i) => {
        if (indexRegistration.skipRefinerOptions) {
          return [];
        }
        let index = allIndexes.find((i) => i.key === indexRegistration.key);
        return finders.getRefinerOptions(index, filterResults);
      });

      refiners = allRefinerOptions.reduce((refiners, options, i) => {
        refiners[db._indexRegistrations[i].key] = options;
        return refiners;
      }, {});

      refinersMeasure.stop();

      /** End Refines */

      /** Calculate the ordered itemIds */
      let itemIds: number[] = [];

      // Assumes `filteredResults` is an array of ordered itemIds,
      // each associated with an indexRegistration
      let orderedSets = filterResults;
      // Sorting, either use the specified sort or the first index key
      let sortKey = db._criteria.sort || db._indexRegistrations[0].key;
      // Find the result set for the index we are supposed to sort by
      let target = orderedSets.find((r) => r.indexKey === sortKey);
      // If descending reverse the itemIds (they should already be sorted asc)
      if (db._criteria.sortDir === "desc") {
        target.matches = reverse(target.matches);
      }
      // order the result sets by which indexes to sort by
      // so those get used in the intersection
      let intersectionMeasure = createMeasurement("query:intersection" + queryId);
      intersectionMeasure.start();
      // move the targeted ordered set to the front
      orderedSets = [target, ...orderedSets.filter((r) => r.indexKey !== sortKey)].filter(Boolean);
      // In order to be a valid result, the itemId needs to appear in EVERY orderedSet
      // The intersection utility function wil use the first set's order to determine the order
      itemIds = intersection(...orderedSets.map((r) => r.matches).filter(Boolean));
      intersectionMeasure.stop();

      // Apply any pagination
      let skip = db._criteria.skip || 0;
      let limit = db._criteria.limit || 1000;
      let trimmedIds = itemIds.slice(skip, skip + limit);

      let hydrateItemsMeasurement = createMeasurement("query:hydrateItems" + queryId);
      hydrateItemsMeasurement.start();
      // Hydrate the items based in the array of itemIds
      let items = await db.allItems.bulkGet(trimmedIds);
      // Check for a stale query id after every async activity
      if (activeQueryId !== queryId) return;
      hydrateItemsMeasurement.stop();

      result = { items, refiners, totalCount: itemIds.length, key: criteriaKey };
      await db.queryResults.put(result);
    }
  );

  // Check for a stale query id after every async activity
  if (activeQueryId !== queryId) return;
  return result;
};

export default query;
