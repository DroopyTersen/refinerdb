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
  - TODO: If there is not a value, can we short circuit and just return all ItemIds right away?
    - can we store a itemId's reference before looping through?
    - Would we have to create an automatic item id index?
    - Or hash a value of "empty" when we index and set the values to
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

END DEXIE TRANSACTION
