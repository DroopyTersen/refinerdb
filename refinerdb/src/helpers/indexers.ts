import { IndexType, SearchIndex, IndexConfig } from "../interfaces";

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
  let hashValues = index.hashFn(item);
  if (typeof hashValues === "string") {
    hashValues = [hashValues];
  }
  return indexValues(hashValues.filter(Boolean), primaryKey, index);
}

function indexNumber(item, primaryKey: number, index: SearchIndex) {
  let hashValues = index.hashFn(item);
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
    let date = index.hashFn(item);
    if (typeof date === "string") {
      date = new Date(date);
    }
    let hash = date.toISOString();
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
