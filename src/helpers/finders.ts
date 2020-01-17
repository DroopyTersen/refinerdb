import {
  IndexFilter,
  SearchIndex,
  IndexType,
  IndexFilterResult,
  RefinerOption,
} from "../interfaces";
import flatten from "lodash/flatten";
import uniq from "lodash/uniq";
import intersection from "lodash/intersection";

import { findNumberRange, findStringRange } from "./binarySearch";

function findByNumber(index: SearchIndex, min?: number, max?: number) {
  if (min === undefined && max === undefined) return null;

  let hashes = findNumberRange(index.sortedKeys, min, max);
  return uniq(flatten(hashes.map((hash) => index.value[hash])));
}

function findByDate(
  // Date Index stores a sorted array of ISO Date Strings
  index: SearchIndex,
  min?: Date,
  max?: Date
) {
  if (min === undefined && max === undefined) return null;

  let minDateStr = min ? min.toISOString() : "";
  let maxDateStr = max ? max.toISOString() : "";
  let hashes = findStringRange(index.sortedKeys, minDateStr, maxDateStr);
  // console.log("TCL: hashes", startIndex, endIndex, hashes);
  return uniq(flatten(hashes.map((hash) => index.value[hash])));
}

function findByString(index: SearchIndex, values: string[]) {
  let isExactEquals = !values.find((v) => v.indexOf("*") > -1);

  if (isExactEquals) {
    return index.sortedKeys.reduce((results, hashKey) => {
      // Is it a match?
      if (values.indexOf(hashKey) > -1) {
        //It's a match so push any items that aren't already in the results array
        let hashMatches = index.value[hashKey];
        hashMatches.forEach((itemId) => {
          if (results.indexOf(itemId) < 0) {
            results.push(itemId);
          }
        });
      }
      return results;
    }, []);
  } else {
    let filterValues = values.map((value) => value.replace(/\*/gi, "").toLowerCase());
    let hashKeys = index.sortedKeys;
    let filteredHashes = hashKeys.filter((hashKey) => {
      let matches = filterValues.filter(
        (filterValue) => hashKey.toLowerCase().indexOf(filterValue) > -1
      );
      return matches.length;
    });
    let itemKeys = filteredHashes.map((hash) => index.value[hash]);
    return uniq(flatten(itemKeys));
  }
}

function findByIndexFilter(
  { indexDefinition, values, min, max }: IndexFilter,
  index: SearchIndex
): number[] {
  if (!indexDefinition || !index) return [];

  // return null if there is no filter value
  if (values === undefined && min === undefined && max === undefined) {
    return null;
  }

  if (indexDefinition.type === IndexType.String) {
    return findByString(index, values as string[]);
  }

  if (indexDefinition.type === IndexType.Number) {
    return findByNumber(index, min as number, max as number);
  }

  if (indexDefinition.type === IndexType.Date) {
    return findByDate(index, min as Date, max as Date);
  }
}

function getRefinerOptions(index: SearchIndex, indexResults: IndexFilterResult[]): RefinerOption[] {
  // Find all matches except for matches for this index
  let noIndexResults = !indexResults || !indexResults.length;
  let nonTargetMatches: number[] = intersection(
    ...indexResults.filter((i) => i.indexKey !== index.key).map((i) => i.matches)
  );

  let refinerOptions: RefinerOption[] = [];
  let hashKeys = Object.keys(index.value);
  for (var i = 0; i < hashKeys.length; i++) {
    let count = nonTargetMatches.length
      ? // If we have non target index filter results, then return the count of their intersection
        intersection(index.value[hashKeys[i]], nonTargetMatches).length
      : // We weren't passed any index results so return the whole hash count
      // otherwise return Zero because we have a nonTarget index filter with no matches
      noIndexResults
      ? index.value[hashKeys[i]].length
      : 0;
    if (count) {
      refinerOptions.push({ key: hashKeys[i], count });
    }
  }

  return refinerOptions;
}

export const finders = {
  findByDate,
  findByNumber,
  findByString,
  findByIndexFilter,
  getRefinerOptions,
};
