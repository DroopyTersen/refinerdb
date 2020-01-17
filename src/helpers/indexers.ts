import { IndexType, SearchIndex } from "../interfaces";

function indexValues(hashValues: string[] | number[], primaryKey, index: SearchIndex) {
	hashValues.forEach(hash => {
		if (!index.value[hash]) {
			index.value[hash] = [];
			index.sortedKeys.push(hash);
		}
		index.value[hash].push(primaryKey);
	});
	return index;
}

function indexString(item, primaryKey: number, hashFn: (item) => string | string[], index: SearchIndex) {
	let hashValues = hashFn(item);
	if (typeof hashValues === "string") {
		hashValues = [hashValues];
	}
	return indexValues(hashValues.filter(Boolean), primaryKey, index);
}

function indexNumber(item, primaryKey: number, hashFn: (item) => number | number[], index: SearchIndex) {
	let hashValues = hashFn(item);
	if (!Array.isArray(hashValues)) {
		hashValues = [hashValues];
	}
	hashValues.map(hash => {
		if (typeof hash === "string") {
			hash = parseFloat(hash);
		}
		return hash;
	});
	return indexValues(hashValues, primaryKey, index);
}

function indexDate(item, primaryKey: number, hashFn: (item) => Date, index: SearchIndex) {
	let date = hashFn(item);
	if (typeof date === "string") {
		date = new Date(date);
	}
	let hash = date.toISOString();
	return indexValues([hash], primaryKey, index);
}

export const indexers = {
	[IndexType.String]: indexString,
	[IndexType.Number]: indexNumber,
	[IndexType.Date]: indexDate,
};
