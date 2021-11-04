import RefinerDB, { QueryResult, SearchIndex, FilterResult } from "..";
import { parseFilter, filterToString } from "../helpers/filterParser";
import { finders } from "../helpers/finders";
import intersection from "lodash/intersection";
import reverse from "lodash/reverse";
import createMeasurement from "../utils/utils";
let activeQueryId = -1;

const query = async (db: RefinerDB, queryId: number = Date.now()): Promise<QueryResult> => {
  activeQueryId = queryId;
  let result: QueryResult = null;
  let filters = parseFilter(db._criteria.filter);

  let allIndexes: SearchIndex[] = (
    await db.indexes.bulkGet(db._indexRegistrations.map((index) => index.key))
  ).filter(Boolean) as any;

  if (!allIndexes || !allIndexes.length) {
    // db.stateMachine.send(IndexEvent.INVALIDATE);
    return Promise.resolve(null);
  }

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
      let filtersMeasure = createMeasurement("query:filters" + queryId);
      filtersMeasure.start();
      // Get an array of arrays. where we store a set of itemId matches for each filter
      let filterResults: FilterResult[] = [];
      for (var i = 0; i < db._indexRegistrations.length; i++) {
        let indexDefinition = db._indexRegistrations[i];
        let filter = filters.find((f) => f.indexKey === indexDefinition.key) || {
          indexKey: indexDefinition.key,
        };
        let filterKey = filterToString(filter);
        let matches = [];
        let cachedFilterResult = await db.filterResults.get(filterKey);

        if (cachedFilterResult && cachedFilterResult.matches) {
          matches = cachedFilterResult.matches;
        } else {
          matches = finders.findByIndexFilter(
            { indexDefinition, ...filter },
            allIndexes.find((i) => i.key === filter.indexKey)
          );
          db.filterResults.put({ key: filterKey, matches, indexKey: filter.indexKey });
        }
        filterResults.push({
          indexKey: filter.indexKey,
          key: filterKey,
          matches,
        });
      }
      filtersMeasure.stop();

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
      let itemIds: number[] = [];
      // If there are no filters, return all items
      if (filterResults.length === 0) {
        itemIds = await db.allItems.toCollection().primaryKeys();
      } else {
        // There are filters so return the intersection of all the matches
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
        orderedSets = [target, ...orderedSets.filter((r) => r.indexKey !== sortKey)].filter(
          Boolean
        );
        itemIds = intersection(...orderedSets.map((r) => r.matches).filter(Boolean));
        intersectionMeasure.stop();

        // console.log("TCL: filtered itemIds", itemIds, filterResults.length);
      }

      let skip = db._criteria.skip || 0;
      let limit = db._criteria.limit || 1000;
      let trimmedIds = itemIds.slice(skip, skip + limit);

      let hydrateItemsMeasurement = createMeasurement("query:hydrateItems" + queryId);
      hydrateItemsMeasurement.start();
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
