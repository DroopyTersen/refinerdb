import React, { useEffect } from "react";
import { IndexConfig, IndexType } from "refinerdb";
import useIndexes from "hooks/useIndexes";

function SetupIndexes({ initialValue }: SetupIndexesProps) {
  let [indexes, setIndexes] = useIndexes();
  console.log("RENDERING IndexesSetup");
  useEffect(() => {
    if (setIndexes) {
      setIndexes([
        { key: "birthYear", type: IndexType.Number, skipRefinerOptions: true },
        { key: "ethnicity", type: IndexType.String },
        { key: "gender", type: IndexType.String },
        { key: "firstName", type: IndexType.String, skipRefinerOptions: true },
        { key: "rank", type: IndexType.Number, skipRefinerOptions: true },
      ]);
    }
  }, [setIndexes]);
  return null;
}

export default React.memo(SetupIndexes);

export interface SetupIndexesProps {
  initialValue: IndexConfig[];
}
