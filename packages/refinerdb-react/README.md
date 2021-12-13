# RefinerDB - React

## Install

```
npm install refinerdb-react
```

## Quick start

1. Define your `getData` async function
2. Define your `indexes`
3. Wrap your app in a `RefinerDBProvider`
4. Create a results view component
5. Create a refiner panel

## Refiners

**! IMPORTANT !** - To use these hooks you need to wrap your components in a `RefinerDBProvider` component.

### Text Refiner

- Useful for textbox refiner controls
- Performs a "contains" query

```tsx
// Setup a refiner on the 'title' index
let [value, setValue] = useTextRefiner("title")
// Use it in JSX
<input value={value} onChange={(e) => setValue(e.currentTarget.value)}>
```

### Multiselect Refiner

- Useful for OR queries
- Ex: Filter movies by genre "Action" or "Comedy"
- Uses a `string[]`
- Returns a tuple: `[values, setValues, options, events ]`
  - `values` is the `string[]` of active filter values
  - `setValues` is the setter for the `string[]` of filter values
  - `options` is the list of available `RefinerOption`
    - In the shape of `{ key, count}`
    - E.g. `{ key: "Drama", count: 42 }`
  - `events` Is a bonus that provider dom event handlers for working with common UI scenarios
    - `selectOnChange` can be applied to the `onChange` of a `<select>`
      - `<select value={values} onChange={events.selectOnChange}>`
    - `checkboxOnChange` can be applied to the `onChange` of an `<input type='checkbox'>`

> Don't forget, because it is a tuple you can rename any of these destructured items

```tsx
let [values, setValues, options, { selectOnChange, checkboxOnChange }] = useMultiselectRefiner(
  indexKey,
  (debounce = 0)
);
```

_Here is an example "CheckboxRefiner" component_

```tsx
function CheckboxRefiner({ indexKey, label = "" }: Props) {
  let [values = [], , options = [], events] = useMultiselectRefiner(indexKey);

  return (
    <Fieldset label={label || indexKey}>
      {options.map((option) => (
        <div key={option.key}>
          <label>
            <input
              type="checkbox"
              value={option.key}
              checked={values.includes(option.key)}
              onChange={events.checkboxOnChange}
            />
            {option.key} - {option.count}
          </label>
        </div>
      ))}
    </Fieldset>
  );
}
```

### Date Range Refiner

- Provides `{ min, max, setMin, setMax }`
- The `min` and `max` are formatted date strings, `YYYY-MM-dd`, so you can easily pop them on a `<input type='date' />`

```tsx
function CreatedDateRefiner() {
  // Reference the 'created_at' index
  let range = useDateRangeRefiner("created_at");
  // range is { min, max, setMin, setMax }
  return (
    <Fieldset label={label || indexKey}>
      <div className="">
        <input
          placeholder="Min"
          value={range.min}
          onChange={(e) => range.setMin(e.currentTarget.valueAsDate)}
          type="date"
        />
        <div>to</div>
        <input
          placeholder="Max"
          value={range.max}
          onChange={(e) => range.setMax(e.currentTarget.valueAsDate)}
          type="date"
        />
      </div>
    </Fieldset>
  );
}
```

### Number Range Refiner

- Provides `{ min, max, setMin, setMax }`

```tsx
function RatingRefiner() {
  // Reference the 'rating' index which is IndexType.Number
  let range = useNumberRangeRefiner("rating");

  return (
    <label>
      Rating
      <br />
      <input
        placeholder="Min"
        value={range.min + ""}
        onChange={(e) => range.setMin(e.target.value)}
        type="number"
      />
      <input placeholder="Max" value={range.max + ""} onChange={(e) => range.setMax(e.target.value)} type="number" />
    </label>
  );
}
```

### Generic useRefiner

`useRefiner(indexKey)`

You pass in the index key and this hook will provide the filter `value`, and `setValue` method for changing the filter value, and the refiner `options`.

For multi-select

```typescript
// A mutli-value string refiner, with the refiner options
let { value, setValue, options } = useRefiner<string[]>("genre");
```

For Dates and Numbers it is common to use a `MinMaxFilterValue` refiner. This will re

```typescript
// A { min, max } refiner
let { value, setValue } = useRefiner<MinMaxFilterValue>("score");
```

You can also pass an optional `RefinerConfig` as a second param to the hook.

In this example we disable the `debounce`.

```typescript
let { value = "", setValue, options = [] } = useRefiner<string>(indexKey, { debounce: 0 });
```

## Results

### useQueryResult

Keeps you up to date with the latest `QueryResult`. As soon as a query completes (after a filter change or a reindex), the useQueryResult state will update and you will re-render.

```tsx
let { items, totalCount } = useQueryResult();
```

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

## Sorting

### useSort

```tsx
type Sort = {
  sortKey: string;
  sortDir: "asc" | "desc";
  setSortKey: (indexKey: string) => void;
  setSortDir: (dir: "asc" | "desc") => void;
  toggleDir: () => void;
  /** Each registered index can be sorted */
  options: {
    /** index key */
    value: string;
    /** Uses the index label */
    text: string;
  };
};
```

```tsx
export default function SortControl() {
  let sort = useSort();
  return (
    <div className="rdb-sort" style={{ display: "flex" }}>
      <select value={sort.sortKey} onChange={(e) => sort.setSortKey(e.currentTarget.value)}>
        {sort.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.text}
          </option>
        ))}
      </select>
      <button
        style={{ marginLeft: "5px" }}
        className="button-outline"
        title="Toggle sort direction"
        onClick={(e) => sort.toggleDir()}
      >
        {sort.sortDir}
      </button>
    </div>
  );
}
```

## Lower Level

### useIndexStatus

Gives you the current `IndexState` (idle, stale, pending, etc...) of your database.

```typescript
useIndexStatus((status) => {
  if (status === "idle") {
    // do work
  }
});
```

### useCriteria

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

### useIndexes

```tsx
let [indexes, setIndexes] = useIndexes();
```

### useRefinerDB

You maybe don't need this one for most situations, but it is an escape hatch if you want to get at the actual `RefinerDB` instance. Most other hooks are built on top of this one.

```typescript
let refinerDB = useRefinerDB();
```

## Tutorial

First, consider your data.

- Which properties do you want to refine by?
- What kind of refiner control would each have?
  - Multi value checkbox?
  - Dropdown?
  - Number Range (min and max values)?
  - Textbox w/ a "contains" search?
  - etc...

Pretend we are dealing an array of `Movie` objects:

```js
{
  title: "A Star Is Born",
  id: 332562,
  released: "2018-10-03",
  score: 7.5,
  genres: ["Drama", "Music", "Romance"],
}
```

We might want...

- A textbox refiner that does a contains filter on `title`
- A date range refiner that filters the `released` date by a `min` and/or a `max`
- A multiselect refiner that filters the `genre`
- A number range refiner that filters by the `score` by a `min` and/or a `max`

TODO: Finish tutorial
