import intersection from "lodash/intersection";
import reverse from "lodash/reverse";
import { IndexFilterResult, IndexConfig, QueryCriteria } from "../..";

/**
Turns an array of sorted sets of itemIds (per index) into a single array of itemIds
- Applies an 'intersection' to the sets to only show items that appear in each index's filter result
- Handles sorting
  - Finds the sorted set associated with the sortKey
  - Puts that sorted set first in the intersection operation so it will be used to order the output
- Applies any skip and limit to slice the output
 */
export function getPagedSortedItemIds(
  orderedSets: IndexFilterResult[],
  criteria: QueryCriteria,
  indexRegistrations: IndexConfig[]
) {
  let itemIds: number[] = [];

  // Assumes `filteredResults` is an array of ordered itemIds,
  // each associated with an indexRegistration
  // Sorting, either use the specified sort or the first index key
  let sortKey = criteria.sort || indexRegistrations[0].key;
  // Find the result set for the index we are supposed to sort by
  let target = orderedSets.find((r) => r.indexKey === sortKey);
  // If descending reverse the itemIds (they should already be sorted asc)
  if (criteria.sortDir === "desc") {
    target.matches = reverse(target.matches);
  }
  // order the result sets by which indexes to sort by
  // so those get used in the intersection
  // move the targeted ordered set to the front
  orderedSets = [target, ...orderedSets.filter((r) => r.indexKey !== sortKey)].filter(Boolean);
  // In order to be a valid result, the itemId needs to appear in EVERY orderedSet
  // The intersection utility function wil use the first set's order to determine the order
  itemIds = intersection(...orderedSets.map((r) => r.matches).filter(Boolean));

  // Apply any pagination
  let skip = criteria.skip || 0;
  let limit = criteria.limit || 1000;
  let trimmedIds = itemIds.slice(skip, skip + limit);

  return { trimmedIds, totalCount: itemIds.length };
}
