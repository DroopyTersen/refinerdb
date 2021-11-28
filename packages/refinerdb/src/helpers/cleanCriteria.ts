import { QueryCriteria } from "../interfaces";

export function cleanCriteria(criteria: QueryCriteria) {
  let cleanedCriteria: QueryCriteria = {};
  // Only if we have a truthy value for sort
  if (criteria.sort) {
    cleanedCriteria.sort = criteria.sort;
  }
  // Only if we have a truthy value for sort
  if (criteria.sortDir) {
    cleanedCriteria.sortDir = criteria.sortDir;
  }
  if (criteria.limit !== undefined) {
    cleanedCriteria.limit = criteria.limit;
  }
  if (criteria.skip !== undefined) {
    cleanedCriteria.skip = criteria.skip;
  }
  if (criteria.filter) {
    cleanedCriteria.filter = {};
    for (let key in criteria.filter) {
      // If it's a string it needs to be truthy
      if (typeof criteria.filter[key] === "string") {
        if (criteria.filter[key]) {
          cleanedCriteria.filter[key] = criteria.filter[key];
        }
        // If it's an array it needs to have at least one value
      } else if (Array.isArray(criteria.filter[key])) {
        if ((criteria.filter[key] as any)?.length) {
          cleanedCriteria.filter[key] = criteria.filter[key];
        }
      } else {
        cleanedCriteria.filter[key] = criteria.filter[key];
      }
    }
  }

  return cleanedCriteria;
}
