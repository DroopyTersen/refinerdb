import { IndexFilter, SearchIndex, IndexType, IndexResult, RefinerOption } from "../interfaces";
import flatten from "lodash/flatten";
import uniq from "lodash/uniq";
import intersection from "lodash/intersection";

import { findNumberRange, findStringRange } from "./binarySearch";

function findByNumber(index: SearchIndex, min?: number, max?: number) {
	if (min === undefined && max === undefined) return null;

	let hashes = findNumberRange(index.sortedKeys, min, max);
	return uniq(flatten(hashes.map(hash => index.value[hash])));
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
	return uniq(flatten(hashes.map(hash => index.value[hash])));
}

function findByString(index: SearchIndex, values: string[]) {
	let isExactEquals = !values.find(v => v.indexOf("*") > -1);

	if (isExactEquals) {
		let results = (values as string[]).map(value => index.value[value]);
		return uniq(flatten(results));
	} else {
		let filterValues = values.map(value => value.replace(/\*/gi, "").toLowerCase());
		let hashKeys = Object.keys(index.value);
		let filteredHashes = hashKeys.filter(hashKey => {
			let matches = filterValues.filter(filterValue => hashKey.toLowerCase().indexOf(filterValue) > -1);
			return matches.length;
		});
		let itemKeys = filteredHashes.map(hash => index.value[hash]);
		return uniq(flatten(itemKeys));
	}
}

function findByIndexFilter({ indexDefinition, values, min, max }: IndexFilter, index: SearchIndex): number[] {
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

function getRefinerOptions(index: SearchIndex, indexResults: IndexResult[]): RefinerOption[] {
	// Find all matches except for matches for this index
	let nonTargetMatches: number[] = intersection(
		...indexResults.filter(i => i.matches && i.indexKey !== index.id).map(i => i.matches)
	);
	// console.log("TCL: nonTargetMatches", nonTargetMatches);

	let refinerOptions: RefinerOption[] = [];
	let hashKeys = Object.keys(index.value);
	for (var i = 0; i < hashKeys.length; i++) {
		// If there aren't any target matches, then us all the matches
		// for the hash on the given index
		let count = nonTargetMatches.length
			? intersection(index.value[hashKeys[i]], nonTargetMatches).length
			: index.value[hashKeys[i]].length;
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
