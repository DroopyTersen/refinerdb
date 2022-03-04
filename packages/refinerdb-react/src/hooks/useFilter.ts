import deepEqual from "just-compare";
import { useState } from "react";
import type { Filter } from "refinerdb";
import { useIndexStatus } from ".";
import { useRefinerDB } from "./useRefinerDB";
import { useSetFilter } from "./useSetFilter";

export interface UseFilterReturnType {
  /** Provides the realtime filter value */
  filter: Filter;
  /** Stable setter function. Takes in the prev value and returns the new value */
  setFilter: (setter: (prev: Filter) => Filter) => void;
  /** Stable function to reset the filter */
  clearFilter: () => void;
}
/** Provides a stable reference to the criteria's filter value as well as a stable update function.
 * Returns a tuple where the first value is the criteria's filter and the second value is the
 * criteria's filter setter (see useSetFilter if you only need a setter). */
export function useFilter(): UseFilterReturnType {
  let refinerDB = useRefinerDB();
  let [filterState, _setFilterState] = useState(() => refinerDB?.criteria?.filter || {});
  let setFilter = useSetFilter();
  let clearFilter = () => setFilter(() => ({}));

  useIndexStatus(() => {
    if (!deepEqual(filterState || {}, refinerDB?.criteria?.filter || {})) {
      _setFilterState(refinerDB?.criteria?.filter || {});
    }
  });

  return {
    filter: filterState,
    setFilter,
    clearFilter,
  };
}
