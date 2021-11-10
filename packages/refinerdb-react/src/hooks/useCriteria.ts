import { QueryCriteria } from "refinerdb";
import useRefinerDB from "./useRefinerDB";
import { useMemo, useState, useEffect } from "react";
import useIndexState from "./useIndexState";

export function useSetCriteria() {
  let refinerDB = useRefinerDB();
  let setCriteria = useMemo(() => {
    return (setter: (prev: QueryCriteria) => QueryCriteria) => {
      refinerDB.setCriteria(setter(refinerDB.criteria));
    };
  }, [refinerDB]);
  return setCriteria;
}

export function useCriteria() {
  let refinerDB = useRefinerDB();
  let { status } = useIndexState();
  let [criteriaState, setCriteriaState] = useState<QueryCriteria>(
    refinerDB ? refinerDB.criteria : {}
  );
  let setCriteria = useSetCriteria();

  // when the Index state changes, check for new criteria
  useEffect(() => {
    if (JSON.stringify(criteriaState) !== JSON.stringify(refinerDB.criteria)) {
      setCriteriaState(refinerDB.criteria);
    }
  }, [status, refinerDB]);

  return [criteriaState, setCriteria] as [QueryCriteria, (updates: QueryCriteria) => void];
}
