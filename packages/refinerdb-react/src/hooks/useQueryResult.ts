import { useEffect, useState } from "react";
import { IndexState, QueryResult } from "refinerdb";
import { useIndexState } from "./useIndexState";
import { useRefinerDB } from "./useRefinerDB";

/** Options to pass to the useQueryResult hook */
export interface UseQueryResultProps {
  /** Defaults to true. If false, only the item Id's will be returned.
   * This can improve performance if you already have your array of items in memory.
   */
  hydrateItems?: boolean;
}

/** Provides the up to date query results.
 * Anytime the indexing state goes back to idle
 * it will check for new query results and update state.
 */
export function useQueryResult({ hydrateItems = true }: UseQueryResultProps = {}): QueryResult {
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
