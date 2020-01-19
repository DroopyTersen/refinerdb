import useRefinerDB from "./useRefinerDB";
import { IndexConfig } from "refinerdb";
import { useRef, useEffect } from "react";

export default function useIndexes(initialValue?: IndexConfig[]) {
  // Store the first value we get as a ref
  let initialValueRef = useRef(initialValue);
  let refinerDB = useRefinerDB();

  let tuple = [null, null];

  if (refinerDB) {
    tuple = [refinerDB.indexRegistrations, refinerDB.setIndexes];
  }
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

  return tuple as [IndexConfig[], (indexes: IndexConfig[]) => void];
}
