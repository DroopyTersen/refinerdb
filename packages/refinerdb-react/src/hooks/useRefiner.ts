import { useEffect, useState } from "react";
import { Filter, MinMaxFilterValue, NumberFilterValue, StringFilterValue } from "refinerdb";
import { useFilter } from "./useFilter";
import { useQueryResult } from "./useQueryResult";
import useDebounce from "./utils/useDebounce";

export interface RefinerConfig {
  debounce: number;
}
const defaultConfig: RefinerConfig = {
  debounce: 250,
};
export type FilterValueType = MinMaxFilterValue | StringFilterValue | NumberFilterValue;
export function useRefiner<T extends FilterValueType>(key: string, config = defaultConfig) {
  let result = useQueryResult({ hydrateItems: false });

  let { filter, setFilter } = useFilter();
  let [value, setValue] = useState<T>(() => getFilterValue(filter, key));
  let filterValue = getFilterValue(filter, key);

  // If a new filter value comes in from external, update state
  useEffect(() => {
    setValue(filterValue);
  }, [filterValue]);

  // Anytime the state filter value changes, debounce update refinerDB
  useDebounce(
    () => {
      if (value !== undefined) {
        setFilter((prev) => ({ ...prev, [key]: value }));
      }
    },
    [value, key],
    config.debounce
  );

  const options = result?.refiners?.[key] || [];

  return [value, setValue, options] as [typeof value, typeof setValue, typeof options];
}

let getFilterValue = (filter: Filter, key: string): any => {
  if (!filter) return null;
  return filter[key];
};
