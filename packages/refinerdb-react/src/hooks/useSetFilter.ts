import { useMemo } from "react";
import { Filter } from "refinerdb";
import { useRefinerDB } from ".";

/**
 * Provides a stable function to update the the RefinerDB criteria's filter. The setter function
 * takes the previous value and expects you to return the new value.
 */
export function useSetFilter(): (setter: (prev: Filter) => Filter) => void {
  let refinerDB = useRefinerDB();

  let setFilter = useMemo(() => {
    return (setter: (prev: Filter) => Filter) => {
      let newFilter = setter(refinerDB.criteria.filter);
      let newCriteria = {
        ...refinerDB.criteria,
        filter: newFilter,
      };
      refinerDB.setCriteria(newCriteria);
    };
  }, [refinerDB]);

  return setFilter;
}
