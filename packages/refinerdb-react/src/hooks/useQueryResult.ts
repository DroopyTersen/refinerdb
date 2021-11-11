import { useIndexState } from "./useIndexState";
import { useEffect, useState } from "react";
import { QueryResult, IndexState } from "refinerdb";
import { useRefinerDB } from "./useRefinerDB";

export function useQueryResult({ hydrateItems = true } = {}) {
  let { status } = useIndexState();
  let refinerDB = useRefinerDB();
  let [result, setResult] = useState<QueryResult>(null);

  useEffect(() => {
    let isMounted = true;
    async function getNewResults() {
      let queryResult: QueryResult = await refinerDB.getQueryResult(hydrateItems);
      if (isMounted) {
        setResult(queryResult);
      }
    }
    if (status === IndexState.IDLE) {
      getNewResults();
    }
    return () => {
      isMounted = false;
    };
  }, [status, refinerDB]);

  return result;
}
