import useIndexState from "./useIndexState";
import { useEffect, useState } from "react";
import { QueryResult, IndexState } from "refinerdb";
import useRefinerDB from "./useRefinerDB";

export default function useQueryResult() {
  let { status } = useIndexState();
  let refinerDB = useRefinerDB();
  let [result, setResult] = useState<QueryResult>(null);

  useEffect(() => {
    let isMounted = true;
    async function getNewResults() {
      let queryResult: QueryResult = await refinerDB.getQueryResult();
      if (isMounted) {
        setResult(queryResult);
      }
    }
    // console.log("TCL: getNewResults -> queryResult", status);
    if (status === IndexState.IDLE) {
      getNewResults();
    }
    return () => (isMounted = false);
  }, [status, refinerDB]);

  return result;
}
