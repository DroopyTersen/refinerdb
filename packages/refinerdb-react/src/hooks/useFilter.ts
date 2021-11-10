import { useEffect, useMemo, useState } from "react";
import { useIndexState, useRefinerDB } from "..";

export function useSetFilter() {
  let refinerDB = useRefinerDB();

  let setFilter = useMemo(() => {
    return (setter: (prev) => any) => {
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
  let clearFilter = () => setFilter(() => ({}));
  let setFilter = useSetFilter();

  useEffect(() => {
    if (JSON.stringify(filterState || {}) !== JSON.stringify(refinerDB?.criteria?.filter || {})) {
      _setFilterState(refinerDB?.criteria?.filter || {});
    }
  }, [status, refinerDB]);

  return {
    filter: filterState,
    setFilter,
    clearFilter,
  };
}
