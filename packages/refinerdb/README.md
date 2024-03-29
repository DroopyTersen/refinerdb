# RefinerDB

A browser database used to support advanced search scenarios. An engine that could power an Amazon Refiner-like search experience.

- [Install](#install)
- [Quick Start](#quick-start)
- [Create a database](#create-a-database)
- [Add items to the database](#add-items-to-the-database)
- [Creating indexes](#creating-indexes)
- [Querying the database](#querying-the-database)
  - [Exact Equals](#exact-equals)
  - [String contains](#string-contains)
  - [Min Max](#min-max)
  - [Sorting](#sorting)
  - [Paging](#paging)
- [Displaying query results](#displaying-query-results)
- [Further Docs](#further-docs)

## Install

```sh
npm install refinerdb
```

## Quick Start

[![Edit refinerdb-vanilla](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/refinerdb-vanilla-9vijf?fontsize=14&hidenavigation=1&theme=dark)

```javascript id:core-quick-start
import { RefinerDB, IndexType } from "refinerdb";

// Create an instance of RefinerDB and register the indexes
let refinerDB = new RefinerDB("movies-db");
refinerDB.setIndexes([
  { key: "title", type: IndexType.String },
  // An index where the key doesn't match the property name on the item
  { key: "genre", type: IndexType.String, path: "genres" },
  // A date index
  { key: "released", type: IndexType.Date, path: "released_date" },
  // A number index
  { key: "score", type: IndexType.Number, path: "vote_average" },
  // A nested 'path' is supported as well
  { key: "director", type: IndexType.String, path: "director.name" },
]);

// Add data
let movies = await fetchMovies();
refinerDB.setItems(movies);

// Query Data
// A 7+ rated 'Action' or 'Comedy' with 'day' in the title
let filter = {
  title: "day*",
  genre: ["Action", "Comedy"],
  score: { min: 7 },
};
let { items, refiners, totalCount } = await refinerDB.query({
  filter,
  sort: "released",
  sortDir: "desc",
});

// items will be an array of movies matching the criteria
// refiners will be an object of like
// {
//     "genre": [
//         { key: "Action", count: 13 },
//         { key: "Comedy", count: 21 },
//         { key: "Drama", count: 42 }
//     ],
//     ...
// }
```

## Create a database

```javascript
import { RefinerDB } from "refinerdb";

// OPTION 1: Just pass a database name
let refinerDB = new RefinerDB("my-db");

// OPTION 2: Pass a config with any or all of the following options
let dbConfig = {
    // How long to wait to reindex after data has changed
    indexDelay: 500,
    // A handler to fire when the State Machine transitions state
    onTransition: (newState) => console.log("Refiner DB State: " + newState);
}
let refinerDB = new RefinerDB("my-db", dbConfig);
```

## Add items to the database

Once you have a database instance you can seed it with an array of items.

```ts
let refinerDB = new RefinerDB("movies");
let movies = await getMovies();
refinerDB.setItems(movies);
```

- The items can be in any shape. But each item needs to have a property that represents the primary key.
  - The primary key can be an `string` or a `number`
- By default RefinerDB assumes that property is `id`
- When creating a database, you can explicitely tell RefinerDB what the primary key is using the `idProperty` setting.

```ts
let refinerDB = new RefinerDB("bookmarks", { idProperty: "__id" });
```

## Creating indexes

What is the shape of your data? For any properties you want to filter/refine, you need to define an Index.

Imagine we had data that looked like this:

```javascript
let items = [
  { title: "Watch the new Matrix", id: 1, tags: ["fun"] },
  { title: "Cut the grass", id: 2, ["chore", "lawn"] },
  { title: "Buy fetilizer", id: 4, tags: ["lawn", "shopping"] },
  { title: "Build RefinerDB", id: 3, ["fun", "code] },
  { title: "Document RefinerDB", id: 11, ["chore", "code"] },
];
```

We would create a `RefinerDB` instance then define two indexes, one for `title`, and one for `tags`. We won't need to filter or sort by `id`, so we dont' need an Index for it.

```javascript
import { RefinerDB, IndexType } from "refinerdb";

let refinerDB = new RefinerDB("my-db");
let indexDefinitions = [
  { key: "tags", type: IndexType.String },
  // Because all of the titles are generally unique, generating a list of
  // refiner options and their counts is not that useful. We can improve
  // performance by skipping that step.
  { key: "title", type: IndexType.String, skipRefinerOptions: true },
];
refinerDB.setIndexes(indexDefinitions);
```

Here are the available `IndexType` options, as well as the full type definition of `IndexConfig`.

```typescript
enum IndexType {
  String = "string",
  Number = "number",
  Date = "Date",
}

interface IndexConfig {
  /**
   * Unique identifier for the index.
   * If no "path" is provided, it is assumed the "key" matches the
   * property name on the item.
   */
  key: string;

  /**
   * String, Number, Date, etc...
   */
  type: IndexType;

  /**
   * If the key doesn't match the item's property name, use path.
   * Allows nested paths like "author.name"
   */
  path?: string;

  /**
   * For things like dates with timestamps, or really long strings,
   * do you really need to calculate refiner option?
   */
  skipRefinerOptions?: boolean;

  /**
   * A convenience property so you can build dynammic controls like
   * a "Sort Dropwdown"
   */
  label?: string;
}
```

## Querying the database

To query, create a `filter` object, where each each property on the object maps to a registered Index key.

In the following example, we are looking for movies where:

- `genre` is "Action" or "Comedy"
- `title` includes "day"
- `score` is greater or equal to 6

```javascript
// Each property on the filter should match a registered index key
let filter = {
  genre: ["Action", "Comedy"],
  title: "day*",
  score: { min: 6 },
};

// Pass the filter to the `query(criteria)` method
let { items, refiners } = await refinerDB.query({ filter });
```

### Exact Equals

```javascript
// Find Action movies
let filter = { genre: "Action" };
```

Pass multiple values and they will be `OR`'d together.

```javascript
// Find movies with a genre of Action or Comedy
let filter = { genre: ["Action", "Comedy"] };
```

If you add multiple indexes to the filter, they will be `AND`'d together.

```javascript
// Find all Action or Horror movies rated PG-13
let filter = { genre: ["Action", "Horror"], mpaa: "PG-13" };
```

Number Indexes work the same way

```javascript
// Find anything with a score of exactly 7.1
let filter = { score: 7.1 };
```

_See below for the min/max filter that may be more useful for Number indexes_

### String contains

You can query `IndexType.String` indexes using a 'contains' by including an `*` (asterisk) in your filter value.

```javascript
// Put an asterisk at the end to do a "contains" query

// Find any movies with 'day' anywhere in the title
let filter = { title: "day*" };

// Find any movies with 'day' or 'night' anywhere in the title
let filter = { title: ["day*", "night*"] };
```

### Min Max

You can query `IndexType.Number` and `IndexType.Date` indexes using a min/max range.

```javascript
// Find all movies with a score greater or equal to 7
let filter = {
  score: { min: 7 },
};

// Find all movies released in 2012 with score less than 5
let filter = {
  released: {
    min: new Date("1/1/2012"),
    max: new Date("12/31/2012"),
  },
  score: { max: 5 },
};
```

### Sorting

TODO: describe `sort` and `sortDir`

### Paging

TODO: describe `limit` and `skip`

## Displaying query results

TODO: describe shape of `QueryResult`

## Further Docs

- [Persisted Stores](docs/persisted-stores.md)
