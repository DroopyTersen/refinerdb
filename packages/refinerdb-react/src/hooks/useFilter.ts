import deepEqual from "just-compare";
import { useEffect, useMemo, useState } from "react";
import type { Filter } from "refinerdb";
import { useIndexState } from "./useIndexState";
import { useRefinerDB } from "./useRefinerDB";

/** Provides a stable function to update the the RefinerDB criteria's filter. The setter function
 * takes the previous value and expects you to return the new value.
 */
export function useSetFilter(): (setter: (prev: Filter) => Filter) => void {
  let refinerDB = useRefinerDB();

  let setFilter = useMemo(() => {
    return (setter: (prev: Filter) => Filter) => {
      let newCriteria = {
        ...refinerDB.criteria,
        filter: setter(refinerDB.criteria.filter),
      };
      refinerDB.setCriteria(newCriteria);
    };
  }, [refinerDB]);

  return setFilter;
}

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
  let { status } = useIndexState();
  let refinerDB = useRefinerDB();
  let [filterState, _setFilterState] = useState(() => refinerDB?.criteria?.filter || {});
  let setFilter = useSetFilter();
  let clearFilter = () => setFilter(() => ({}));

  useEffect(() => {
    if (!deepEqual(filterState || {}, refinerDB?.criteria?.filter || {})) {
      _setFilterState(refinerDB?.criteria?.filter || {});
    }
  }, [status, refinerDB]);

  return {
    filter: filterState,
    setFilter,
    clearFilter,
  };
}
