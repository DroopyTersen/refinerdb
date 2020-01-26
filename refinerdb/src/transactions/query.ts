import RefinerDB, { QueryResult, SearchIndex, FilterResult } from "..";
import { parseFilter, filterToString } from "../helpers/filterParser";
import { finders } from "../helpers/finders";
import intersection from "lodash/intersection";
import reverse from "lodash/reverse";
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

  await db.transaction(
    "rw",
    db.indexes,
    db.allItems,
    db.filterResults,
    db.queryResults,
    async () => {
      // Get an array of arrays. where we store a set of itemId matches for each filter
      let filterResults: FilterResult[] = [];
      for (var i = 0; i < db._indexRegistrations.length; i++) {
        let indexDefinition = db._indexRegistrations[i];
        let filter = filters.find((f) => f.indexKey === indexDefinition.key) || {
          indexKey: indexDefinition.key,
        };
        let filterKey = filterToString(filter);
        let matches = [];
        let cachedFilterResult = db.filterResults.get(filterKey) as any;
        if (cachedFilterResult && cachedFilterResult.matches) {
          matches = cachedFilterResult.itemIds;
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

      console.log("TCL: filterResults", filterResults);
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

      let itemIds: number[] = [];
      // If there are no filters, return all items
      if (filterResults.length === 0) {
        itemIds = await db.allItems.toCollection().primaryKeys();
      } else {
        // There are filters so return the intersection of all the matches
        let orderedSets = filterResults;
        if (db._criteria.sort) {
          let target = orderedSets.find((r) => r.indexKey === db._criteria.sort);
          console.log("TARGET", target);
          if (db._criteria.sortDir === "desc") {
            target.matches = reverse(target.matches);
          }
          orderedSets = [
            target,
            ...orderedSets.filter((r) => r.indexKey !== db._criteria.sort),
          ].filter(Boolean);
        }
        itemIds = intersection(...orderedSets.map((r) => r.matches).filter(Boolean));
        // console.log("TCL: filtered itemIds", itemIds, filterResults.length);
      }
      // TODO: how to handle sort?

      let skip = db._criteria.skip || 0;
      let limit = db._criteria.limit || 1000;
      let trimmedIds = itemIds; // itemIds.slice(skip, skip + limit);

      let items = await db.allItems.bulkGet(trimmedIds);
      // Check for a stale query id after every async activity
      if (activeQueryId !== queryId) return;

      result = { items, refiners, totalCount: itemIds.length, key: db.getCriteriaKey() };
      db.queryResults.put(result);
    }
  );

  // Check for a stale query id after every async activity
  if (activeQueryId !== queryId) return;
  return result;
};

export default query;
