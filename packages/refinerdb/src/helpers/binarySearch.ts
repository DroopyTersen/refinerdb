// Inspired by: https://github.com/darkskyapp/binary-search#readme
export default function binarySearch<T>(
  sortedArray: T[],
  target: T,
  comparator: (item: T, target: T) => number,
  round?: "up" | "down"
) {
  var mid, cmp;

  let low = 0;
  let high = sortedArray.length - 1;

  while (low <= high) {
    // The naive `low + high >>> 1` could fail for array lengths > 2**31
    // because `>>>` converts its operands to int32. `low + (high - low >>> 1)`
    // works for array lengths <= 2**32-1 which is also Javascript's max array
    // length.
    mid = low + ((high - low) >>> 1);
    cmp = +comparator(sortedArray[mid], target);

    // Too low.
    if (cmp < 0.0) low = mid + 1;
    // Too high.
    else if (cmp > 0.0) high = mid - 1;
    // Key found.
    else {
      return mid;
    }
  }

  // return closest
  if (round === "up") {
    if (high + 1 > sortedArray.length - 1) {
      return -1;
    }
    return high + 1;
  }
  if (round === "down") {
    if (high < 0) {
      return -1;
    }
    return high <= sortedArray.length - 1 ? high : sortedArray.length - 1;
  }
  // Key not found.
  return ~low;
}

export function findRange<T>(
  sortedArray: T[],
  comparator: (item: T, target: T) => number,
  min?: T,
  max?: T
): T[] {
  let startIndex = 0;
  let endIndex = sortedArray.length - 1;

  // // console.log("TCL: sortedKeys", sortedKeys);
  if (min) {
    startIndex = binarySearch(sortedArray, min, comparator, "up");
  }
  if (max) {
    endIndex = binarySearch(sortedArray, max, comparator, "down");
  }

  // Binary search will
  if (endIndex < 0 || startIndex < 0) {
    return [];
  }

  return sortedArray.slice(startIndex, endIndex + 1);
}

export function findNumberRange(sortedArray: number[], min?: number, max?: number): number[] {
  return findRange(sortedArray, compareNumbers, min, max);
}

export function findStringRange(sortedArray: string[], min?: string, max?: string): string[] {
  return findRange(sortedArray, compareStrings, min, max);
}
export function compareStrings(a: string, b: string) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function compareNumbers(a: number, b: number) {
  return a - b;
}
