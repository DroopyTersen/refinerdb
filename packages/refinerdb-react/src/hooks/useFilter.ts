import { useCallback } from "react";
import useCriteria from "./useCriteria";

export default function useFilter() {
  let [criteria, setCriteria] = useCriteria();
  let filter = criteria?.filter || {};

  let clearFilter = useCallback(() => {
    setCriteria({ filter: {} });
  }, [setCriteria]);

  let setFilter = useCallback(
    (updates) => {
      setCriteria({
        filter: {
          ...filter,
          ...updates,
        },
      });
    },
    [filter, setCriteria]
  );

  return {
    filter,
    setFilter,
    clearFilter,
  };
}
