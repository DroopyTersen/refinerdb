# Query

- Only 1 active query at a time.
  - Is that right? shouldn't that be at the database level?
  - So we could have multiple RefinerDB instances at once?
  - Can we store the active queries in a Map using the dbName as key?
  - This is used in a few spots, can we abstract it into a util?

Get all the indexes. These are the actual computed indexes, not the
index registrations.

```ts
await db.indexes.bulkGet(db._indexRegistrations.map((index) => index.key));
```

```ts
persistedCollection.bulkGet(ids);
```

If no indexes in the PersistedStore, return null

Get the criteriaKey

BEGIN DEXIE TRANSACTION

Check to see if there is already a queryResult matching the criteriaKey

```ts
let cachedResult = (await db.queryResults.get(criteriaKey)) as any;
if (cachedResult) {
  return cachedResult as QueryResult;
}
```

### Create the `filterResults`

It's an array of arrays

- each item in the array aligns to an indexRegistration
- each item in an array is an array of itemIds that match the active filter value for the associated index.

Foreach `db_indexRegistration`,

- see if there is an active filter value, if not create an blank filter object
  ```ts
  let indexDefinition = db._indexRegistrations[i];
  let filter = filters.find((f) => f.indexKey === indexDefinition.key) || {
    indexKey: indexDefinition.key,
  };
  ```
- Create a key off the filter value and see if we have a cached filterResult

  ```ts
  let filterKey = filterToString(filter);
  let cachedFilterResult = await db.filterResults.get(filterKey);

  if (cachedFilterResult && cachedFilterResult.matches) {
    matches = cachedFilterResult.matches;
  }
  ```

- If not, call `finders.findByIndexFilter` and then persist the result
  - This call goes through an N\*M reduce function to get the itemIds by looping over each indexed hashed value, checking for a match, and creating a distinct list of itemids
  ```ts
  matches = finders.findByIndexFilter(
    { indexDefinition, ...filter },
    allIndexes.find((i) => i.key === filter.indexKey)
  );
  db.filterResults.put({ key: filterKey, matches, indexKey: filter.indexKey });
  ```
- build up the `filterResults` array
  ```ts
  filterResults.push({
    indexKey: filter.indexKey,
    key: filterKey,
    matches,
  });
  ```

### Create `refinerOptions`

Loop through each index registration

- If it has `skipRefinerOptions` return `[]`
- Otherwise calculate refinerOptions
  ```ts
  let index = allIndexes.find((i) => i.key === indexRegistration.key);
  return finders.getRefinerOptions(index, filterResults);
  ```

reduce them into an object

```ts
refiners = allRefinerOptions.reduce((refiners, options, i) => {
  refiners[db._indexRegistrations[i].key] = options;
  return refiners;
}, {});
```

### Merge ordered `itemIds`

Assumes `filteredResults` is an array of ordered itemIds, `orderedSets`

Find the correct orderedSet (and maybe reverse it)

```ts
let itemIds: number[] = [];

// Assumes `filteredResults` is an array of ordered itemIds,
// each associated with an indexRegistration
let orderedSets = filterResults;
// Sorting, either use the specified sort or the first index key
let sortKey = db._criteria.sort || db._indexRegistrations[0].key;
// Find the result set for the index we are supposed to sort by
let target = orderedSets.find((r) => r.indexKey === sortKey);
// If descending reverse the itemIds (they should already be sorted asc)
if (db._criteria.sortDir === "desc") {
  target.matches = reverse(target.matches);
}
```

### Apply an intersection logic

```ts
// move the targeted ordered set to the front
orderedSets = [target, ...orderedSets.filter((r) => r.indexKey !== sortKey)].filter(Boolean);
// In order to be a valid result, the itemId needs to appear in EVERY orderedSet
// The intersection utility function wil use the first set's order to determine the order
itemIds = intersection(...orderedSets.map((r) => r.matches).filter(Boolean));
```

### Hydrate Items based `trimmedIds`

```ts
// Apply any pagination
let skip = db._criteria.skip || 0;
let limit = db._criteria.limit || 1000;
let trimmedIds = itemIds.slice(skip, skip + limit);

// Hydrate the items based in the array of itemIds
let items = await db.allItems.bulkGet(trimmedIds);
```

### Persist the QueryResult

```ts
result = { items, refiners, totalCount: itemIds.length, key: criteriaKey };
await db.queryResults.put(result);
```

END DEXIE TRANSACTION
