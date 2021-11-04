import React from "react";
import type { IndexConfig } from "refinerdb";
import { useIndexes, useRefinerDB } from "..";

export interface DataSetupProps {
  indexes: IndexConfig[];
  getItems: () => Promise<any[]>;
}

export function DataSetupButton({ indexes, getItems }) {
  let refinerDB = useRefinerDB();
  useIndexes(indexes);

  const refreshData = async () => {
    let isUnmounted = false;
    if (refinerDB) {
      let items = await getItems();
      if (isUnmounted) return;

      refinerDB.setItems(items);
    }

    return () => {
      isUnmounted = true;
    };
  };

  return (
    <button type="button" onClick={refreshData}>
      Refresh Data
    </button>
  );
}
