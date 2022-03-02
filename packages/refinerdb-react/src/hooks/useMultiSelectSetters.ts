import { useMemo } from "react";
import { useSetFilter } from "./useSetFilter";

export function useMultiSelectSetters(indexKey: string, debounce = 0) {
  let setFilter = useSetFilter();

  let setters = useMemo(() => {
    const appendValue = (value: string) => {
      setFilter((prevFilter) => {
        let newFilter = { ...prevFilter };
        let prevValues = (newFilter[indexKey] as string[]) || [];
        let newValues = prevValues?.filter((v) => v !== value);
        newValues?.push(value);
        newFilter[indexKey] = newValues;
        return newFilter;
      });
    };
    const toggleValue = (value: string) => {
      setFilter((prevFilter = {}) => {
        let newFilter = { ...prevFilter };
        let prevValues = (newFilter[indexKey] as string[]) || [];
        let alreadyThere = prevValues?.includes(value);
        let newValues = prevValues.filter((v) => v !== value);
        if (!alreadyThere) {
          newValues.push(value);
        }
        newFilter[indexKey] = newValues;
        if (newValues.length === 0) {
          delete newFilter[indexKey];
        }
        return newFilter;
      });
    };
    return {
      appendValue,
      toggleValue,
    };
  }, [setFilter, indexKey]);

  return setters;
}
