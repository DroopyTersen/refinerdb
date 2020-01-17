# RefinerDB

A browser database (indexeddb wrapper) used to support advanced search scenarios. An engine that could power an Amazon Refiner-like search experience.

## Install

```sh
npm install refinerdb
```

## Quick Start

TOOD: Show a quick example of using it

## Setup

### Create the Database

```javascript
import RefinerDB from "refinerdb";

// OPTION 1: Just pass a database name
let refinerDB = new RefinerDB("my-db");

// OPTION 2: Pass a config
let dbConfig = {
    // How long to wait to reindex after data has changed
    indexDelay: 500,
    // A handler to fire when the State Machine transitions state
    onTransition: (newState) => console.log("Refiner DB State: " + newState);
}
let refinerDB = new RefinerDB("my-db", dbConfig);
```

### Define your indexes

What is the shape of your data? For any properties you want to filter/refine, you need to define an `IndexConfig`.

Imagine we had data that looked like this:

```javascript
let items = [
  { title: "one", id: 1 },
  { title: "two", id: 2 },
  { title: "four", id: 4 },
  { title: "three", id: 3 },
  { title: "one", id: 11 },
];
```

We would create a `RefinerDB` instance then setup two `IndexConfig` definitions, one for `title`, and one for `id`.

```javascript
import RefinerDB, { IndexType } from "refinerdb";

let refinerDB = new RefinerDB("my-db");
let indexDefinitions = [
  { key: "title", hashFn: (item) => item.title, type: IndexType.String },
  { key: "id", hashFn: (item) => item.id, type: IndexType.Number, skipRefinerOptions: true },
];
refinerDB.setIndexes(indexDefinitions);
```

Here are the available `IndexType` options, as well as the full type definition of `IndexConfig`.

```typescript
export enum IndexType {
  String = "string",
  Number = "number",
  Date = "Date",
}

export interface IndexConfig {
  key: string;
  type: IndexType;
  hashFn: (item: any) => any;
  // For things like dates with timestamps, or really long strings, do you really need to calculate refiner option?
  skipRefinerOptions?: boolean;
}
```
