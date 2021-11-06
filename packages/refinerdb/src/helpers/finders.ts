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
import { getSortedIds } from "./indexers";

function findByNumber(index: SearchIndex, min?: number, max?: number) {
  if (min === undefined && max === undefined && index?.sortedIds?.length) return index.sortedIds;

  let hashes = findNumberRange(index.sortedKeys, min, max);
  return uniq(flatten(hashes.map((hash) => index.value[hash])));
}

function findByDate(
  // Date Index stores a sorted array of ISO Date Strings
  index: SearchIndex,
  min?: Date,
  max?: Date
) {
  // if (min === undefined && max === undefined) return null;

  let minDateStr = min ? min.toISOString() : "";
  let maxDateStr = max ? max.toISOString() : "";

  if (!minDateStr && !maxDateStr && index?.sortedIds?.length) return index.sortedIds;

  let hashes = findStringRange(index.sortedKeys, minDateStr, maxDateStr);
  // console.log("TCL: hashes", startIndex, endIndex, hashes);
  return uniq(flatten(hashes.map((hash) => index.value[hash])));
}

function findByString(index: SearchIndex, values: string[] = []) {
  values = (values || []).filter(Boolean);
  let isExactEquals = !values.find((v) => v.indexOf("*") > -1);

  if (isExactEquals) {
    return !values?.length && index?.sortedIds?.length
      ? index.sortedIds
      : getSortedIds(index, values);
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

//TODO: is there a way to short circuit and return all itemIds
// if there is no values or min/max?
function findByIndexFilter(
  { indexDefinition, values, min, max }: IndexFilter,
  index: SearchIndex
): number[] {
  if (!indexDefinition || !index) return [];

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

function getRefinerOptions(
  index: SearchIndex,
  indexFilterResults: IndexFilterResult[] = []
): RefinerOption[] {
  // Figure out which filter result sets should be used to calculate the options
  // All results sets except the index being calculated
  indexFilterResults = indexFilterResults || [];
  // TODO: is this what should be returning? Or null?
  if (!index || !index.key) return [];
  let nonTargetFilterResults = indexFilterResults.filter((f) => f.indexKey !== index.key);
  // Find all matches except for matches for this index
  let nonTargetMatches: number[] = intersection(...nonTargetFilterResults.map((f) => f.matches));

  let refinerOptions: RefinerOption[] = [];
  let hashKeys = Object.keys(index.value);
  for (var i = 0; i < hashKeys.length; i++) {
    let count =
      !nonTargetFilterResults || !nonTargetFilterResults.length
        ? // We weren't passed any non target filter results so return the whole hash count
          index.value[hashKeys[i]].length
        : nonTargetMatches.length
        ? // If we have non target index filter results, then return the count of their intersection
          intersection(index.value[hashKeys[i]], nonTargetMatches).length
        : // otherwise return Zero because we have a nonTarget index filter with no matches
          0;

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
