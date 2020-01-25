import useRefinerDB from "./useRefinerDB";
import { useCallback, useMemo, useState } from "react";
import useCriteria from "./useCriteria";

export default function useFilter() {
  let refinerDB = useRefinerDB();

  let criteria = useCriteria();
  let filter = criteria?.filter || {};

  let clearFilter = useCallback(() => {
    criteria.filter = {};
    refinerDB.setCriteria(criteria);
  }, [criteria, refinerDB]);

  let setFilter = useCallback(
    (newFilter) => {
      criteria.filter = newFilter;
      refinerDB.setCriteria(newFilter);
    },
    [criteria, refinerDB]
  );

  return {
    filter,
    setFilter,
    clearFilter,
  };
}
