import { useState } from "react";
import { QueryResult } from "refinerdb";
import { useIndexStatus } from ".";
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
  let refinerDB = useRefinerDB();
  let [result, setResult] = useState<QueryResult>(null);

  useIndexStatus((status) => {
    let isMounted = true;
    async function getNewResults() {
      let queryResult: QueryResult = await refinerDB.getQueryResult(hydrateItems);
      if (isMounted) {
        setResult(queryResult);
      }
    }
    if (status === "idle") {
      getNewResults();
    }

    return () => {
      isMounted = false;
    };
  });

  return result;
}
