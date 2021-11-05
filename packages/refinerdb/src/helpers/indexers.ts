import { IndexType, SearchIndex, IndexConfig } from "../interfaces";
import get from "lodash/get";
export function indexValues(hashValues: string[] | number[], primaryKey, index: SearchIndex) {
  if (!index.value) index.value = {};
  hashValues.forEach((hash) => {
    if (hash === undefined) return;
    if (!index.value[hash]) {
      index.value[hash] = [];
      if (!index.sortedKeys) index.sortedKeys = [];
      index.sortedKeys.push(hash);
    }
    index.value[hash].push(primaryKey);
  });
  return index;
}

function indexString(item, primaryKey: number, index: SearchIndex) {
  let hashValues = get(item, index.path || index.key);
  if (typeof hashValues === "string") {
    hashValues = [hashValues];
  }
  return indexValues(hashValues.filter(Boolean), primaryKey, index);
}

function indexNumber(item, primaryKey: number, index: SearchIndex) {
  let hashValues = get(item, index.path || index.key);
  if (!Array.isArray(hashValues)) {
    hashValues = [hashValues];
  }
  hashValues = hashValues
    .map((hash) => {
      if (typeof hash === "string") {
        hash = parseFloat(hash);
      }
      return hash;
    })
    .filter((hash) => !isNaN(hash));
  return indexValues(hashValues, primaryKey, index);
}

function indexDate(item, primaryKey: number, index: SearchIndex) {
  try {
    let date = get(item, index.path || index.key);
    if (typeof date === "string") {
      date = new Date(date);
    }
    let hash = date.toISOString();
    return indexValues([hash], primaryKey, index);
  } catch (err) {
    return indexValues([], primaryKey, index);
  }
}

// TODO: unit test this
// it("should return itemIds that are in order of sortedKeys")
export const getSortedIds = (index: SearchIndex, values: string[]): number[] => {
  return index.sortedKeys.reduce((results, hashKey) => {
    // Is it a match? Or do we not have values?
    if (values.indexOf(hashKey) > -1 || !values.length) {
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
};

export const indexers = {
  [IndexType.String]: indexString,
  [IndexType.Number]: indexNumber,
  [IndexType.Date]: indexDate,
};

export function checkIfModifiedIndexes(current: IndexConfig[], next: IndexConfig[]): boolean {
  return JSON.stringify(current) !== JSON.stringify(next);
}
