import { useCallback, useMemo } from "react";
import { useFilter } from "./useFilter";

export function useActiveFilters() {
  let { filter, setFilter, clearFilter } = useFilter();

  let clearFilterValue = useCallback(
    ({ key, value }) => {
      setFilter((prevFilter = {}) => {
        let prevValue = prevFilter[key];
        if (!prevValue) return prevFilter;

        if (Array.isArray(prevValue)) {
          let newValue = (prevValue as any[]).filter((v) => v !== value);
          return { ...prevFilter, [key]: newValue };
        } else {
          return {
            ...prevFilter,
            [key]: null,
          };
        }
      });
    },
    [setFilter]
  );

  let activeFilters = useMemo(() => {
    let filters = Object.keys(filter)
      .map((key) => {
        let values: any = filter[key];
        if (values?.min || values?.max) {
          values = [`${values?.min || "*"} - ${values?.max || "*"}`];
        } else if (!Array.isArray(values)) values = [values as any];

        return values.map((value) => ({ key, value }));
      })
      .flat()
      .filter((f) => f.value);

    return filters;
  }, [filter]);

  return {
    activeFilters,
    clearFilterValue,
    clearAllFilters: clearFilter,
  };
}
