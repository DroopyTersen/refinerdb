import { QueryCriteria } from "refinerdb";
import useRefinerDB from "./useRefinerDB";
import { useCallback, useState, useEffect } from "react";
import useIndexState from "./useIndexState";

export default function useCriteria() {
  let refinerDB = useRefinerDB();
  let { status } = useIndexState();
  let [criteria, setCriteria] = useState<QueryCriteria>(refinerDB ? refinerDB.criteria : {});

  // when the Index state changes, check for new criteria
  useEffect(() => {
    // console.log("NEW CRITERIA", refinerDB.criteria);
    setCriteria(refinerDB.criteria || {});
  }, [status, refinerDB]);

  let updateCriteria = useCallback(
    (updates: QueryCriteria) => {
      let newCriteria = {
        ...refinerDB.criteria,
        ...updates,
      };
      refinerDB.setCriteria(newCriteria);
    },
    [refinerDB]
  );

  return [criteria, updateCriteria] as [QueryCriteria, (updates: QueryCriteria) => void];
}
