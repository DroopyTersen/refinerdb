import deepEqual from "just-compare";
import { useEffect, useMemo, useState } from "react";
import { QueryCriteria } from "refinerdb";
import { useIndexState } from "./useIndexState";
import { useRefinerDB } from "./useRefinerDB";

/** Provides a stable function to update the the RefinerDB criteria. The setter function
 * follows the same signate as the useState setter function. AKA it takes the previous
 * value and expects you to return the new value.
 */
export function useSetCriteria(): (setter: (prev: QueryCriteria) => QueryCriteria) => void {
  let refinerDB = useRefinerDB();
  let setCriteria = useMemo(() => {
    return (setter: (prev: QueryCriteria) => QueryCriteria) => {
      refinerDB.setCriteria(setter(refinerDB.criteria));
    };
  }, [refinerDB]);
  return setCriteria;
}

/** Provides a stable reference to the criteria value as well as a stable update function.
 * Returns a tuple where the first value is the criteria and the second value is the
 * criteria setter (see useSetCriteria if you only need a setter). */
export function useCriteria() {
  let refinerDB = useRefinerDB();
  let { status } = useIndexState();
  let [criteriaState, setCriteriaState] = useState<QueryCriteria>(
    refinerDB ? refinerDB.criteria : {}
  );
  let setCriteria = useSetCriteria();

  // when the Index state changes, check for new criteria
  useEffect(() => {
    if (!deepEqual(criteriaState, refinerDB.criteria)) {
      setCriteriaState(refinerDB.criteria);
    }
  }, [status, refinerDB]);

  return [criteriaState, setCriteria] as [
    getter: QueryCriteria,
    setter: (setter: (prev: QueryCriteria) => QueryCriteria) => void
  ];
}
