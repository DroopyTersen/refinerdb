import { IndexType, SearchIndex, IndexConfig } from "../interfaces";
import get from "lodash/get";
export const NULL_HASH = "_null";

export function indexValues(hashValues: string[] | number[], primaryKey, index: SearchIndex) {
  if (!index.value) index.value = {};
  hashValues.forEach((hash) => {
    if (hash === undefined) return;
    if (!index.value[hash]) {
      index.value[hash] = [];
      if (!index.sortedKeys) index.sortedKeys = [];
      if (hash !== NULL_HASH) {
        index.sortedKeys.push(hash);
      }
    }
    index.value[hash].push(primaryKey);
  });
  return index;
}

function indexString(item, primaryKey: number, index: SearchIndex) {
  let hashValues = get(item, index.path || index.key, []);
  if (typeof hashValues === "string") {
    hashValues = [hashValues];
  }
  hashValues = hashValues.filter(Boolean);
  if (!hashValues.length) {
    hashValues = [NULL_HASH];
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

  if (!hashValues.length) {
    hashValues = [NULL_HASH];
  }
  return indexValues(hashValues, primaryKey, index);
}

function indexDate(item, primaryKey: number, index: SearchIndex) {
  try {
    let date = get(item, index.path || index.key);
    let hash = "";
    if (date) {
      if (typeof date === "string") {
        date = new Date(date);
      }
      hash = date.toISOString();
    } else {
      hash = NULL_HASH;
    }
    return indexValues([hash], primaryKey, index);
  } catch (err) {
    return indexValues([], primaryKey, index);
  }
}

export const indexers = {
  [IndexType.String]: indexString,
  [IndexType.Number]: indexNumber,
  [IndexType.Date]: indexDate,
};

export function checkIfModifiedIndexes(current: IndexConfig[], next: IndexConfig[]): boolean {
  return JSON.stringify(current) !== JSON.stringify(next);
}
