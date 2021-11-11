import deepEqual from "just-compare";
import { useEffect, useMemo, useState } from "react";
import { IndexConfig } from "refinerdb";
import { useIndexState } from "./useIndexState";
import { useRefinerDB } from "./useRefinerDB";

export function useSetIndexes() {
  let refinerDB = useRefinerDB();

  let setIndexRegistrations = useMemo(() => {
    return (setter: (prev: IndexConfig[]) => IndexConfig[] | IndexConfig[]) => {
      let newVal = typeof setter === "function" ? setter(refinerDB.indexRegistrations) : setter;
      refinerDB.setIndexes(newVal);
    };
  }, [refinerDB]);

  return setIndexRegistrations;
}
export function useIndexes() {
  // Store the first value we get as a ref
  let refinerDB = useRefinerDB();
  let { status } = useIndexState();
  let setIndexes = useSetIndexes();

  let [indexes, _setIndexes] = useState<IndexConfig[]>(() => {
    return refinerDB?.indexRegistrations || [];
  });

  // when the Index state changes, check for new indexDefinitions
  useEffect(() => {
    // console.log("NEW Indexes", refinerDB.criteria);
    if (!deepEqual(refinerDB.indexRegistrations || [], indexes)) {
      _setIndexes(refinerDB.indexRegistrations || []);
    }
  }, [status, refinerDB]);

  return [indexes, setIndexes] as [IndexConfig[], typeof setIndexes];
}
