import useRefinerDB from "./useRefinerDB";
import { IndexConfig } from "refinerdb";
import { useRef, useEffect, useState, useCallback } from "react";
import useIndexState from "./useIndexState";

export default function useIndexes(initialValue?: IndexConfig[]) {
  // Store the first value we get as a ref
  let initialValueRef = useRef(initialValue);
  let refinerDB = useRefinerDB();
  let { status } = useIndexState();

  let [indexes, setIndexes] = useState<IndexConfig[]>(() => {
    if (refinerDB && refinerDB.indexRegistrations) {
      return refinerDB.indexRegistrations;
    }
    return [];
  });

  // when the Index state changes, check for new indexDefinitions
  useEffect(() => {
    // console.log("NEW Indexes", refinerDB.criteria);
    setIndexes(refinerDB.indexRegistrations || []);
  }, [status, refinerDB]);

  const updateIndexes = useCallback(
    (indexes: IndexConfig[]) => {
      refinerDB.setIndexes(indexes || []);
    },
    [refinerDB]
  );

  // Once the DB loads, check to see if we have an initial value to set
  useEffect(() => {
    console.log("Try Initial Index setup");
    if (refinerDB && initialValueRef.current) {
      console.log("Initial Index setup", initialValueRef.current);
      refinerDB.setIndexes(initialValueRef.current);
      // Clear out the initial value ref so we don't keep re-setting it
      initialValueRef.current = null;
    }
  }, [refinerDB]);

  return [indexes, updateIndexes] as [IndexConfig[], (indexes: IndexConfig[]) => void];
}
