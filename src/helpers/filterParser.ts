import { IndexFilter, Filter } from "../interfaces";
import omit from "lodash/omit";

export function parseFilter(filter: Filter): IndexFilter[] {
  if (!filter) return [];

  let filters = Object.keys(filter).map((indexKey) => {
    let indexFilter: IndexFilter = {
      indexKey,
    };
    let filterVal = filter[indexKey];
    if (Array.isArray(filterVal)) {
      indexFilter.values = filterVal;
    } else if (typeof filterVal === "object") {
      indexFilter = {
        ...indexFilter,
        ...filterVal,
      };
    } else {
      indexFilter.values = [filterVal as any];
    }
    return indexFilter;
  });

  return filters;
}

export function filterToString(filter: IndexFilter) {
  if (!filter) return "";
  return JSON.stringify(omit(filter, "indexDefinition"));
}
