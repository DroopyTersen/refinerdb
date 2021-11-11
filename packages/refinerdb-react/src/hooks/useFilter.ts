import { useEffect, useMemo, useState } from "react";
import type { Filter } from "refinerdb";
import deepEqual from "just-compare";
import { useIndexState } from "./useIndexState";
import { useRefinerDB } from "./useRefinerDB";

export function useSetFilter() {
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

export function useFilter() {
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
