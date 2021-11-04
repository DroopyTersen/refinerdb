# RefinerDB - React

## Components

### `RefinerDBProvider`

## Hooks

**! IMPORTANT !** - To use these hooks you need to wrap your components in a `RefinerDBProvider` component.

### `useRefiner(indexKey)`

You pass in the index key and this hook will provide the filter `value`, and `setValue` method for changing the filter value, and the refiner `options`.

```typescript
// A mutli-value string refiner, with the refiner options
let { value, setValue, options } = useRefiner<string[]>("genre");
```

```typescript
// A { min, max } refiner
let { value, setValue } = useRefiner<MinMaxFilterValue>("score");
```

You can also pass an optional `RefinerConfig` as a second param to the hook.

In this example we disable the `debounce`.

```typescript
let { value = "", setValue, options = [] } = useRefiner<string>(indexKey, { debounce: 0 });
```

### `useIndexState()`

Gives you the current `IndexState` (idle, stale, pending, etc...) of your database.

```typescript
let { status } = useIndexState();
```

### `useQueryResult()`

Keeps you up to date with the latest `QueryResult`. As soon as a query completes (after a filter change or a reindex), the useQueryResult state will update and you will re-render.

_Example component that takes a `renderItem` prop to call for each result item_

```typescript
function ItemResults({ renderItem }) {
  let result = useQueryResult();
  if (!result || !result.items) return null;
  if (!result.items.length) return <>No Results</>;
  return <div>{result.items.map(renderItem)}</div>;
}
```

```typescript
export interface QueryResult {
  key: string;
  items: any[];
  refiners: {
    [key: string]: RefinerOption[];
  };
  totalCount: number;
}
```

### `useCriteria()`

Your `RefinerDB` instance keeps track of things like the filtering, sorting and paging in the `criteria`.

Using this hook will give your back the `QueryCriteria` value on your `RefinerDB` instance, as well as an `updateCriteria` function that takes an updates object and merges in your changes (vs completely replacing the criteria).

```typescript
let [criteria, updateCriteria] = useCriteria();
```

```typescript
export interface QueryCriteria {
  filter?: Filter;
  sort?: string;
  sortDir?: "asc" | "desc";
  limit?: number;
  skip?: number;
}
```

### `useRefinerDB()`

You maybe don't need this one for most situations, but it is an escape hatch if you want to get at the actual `RefinerDB` instance. Most other hooks are built on top of this one.

```typescript
let refinerDB = useRefinerDB();
```
