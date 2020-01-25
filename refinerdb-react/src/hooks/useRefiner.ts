import useQueryResult from "./useQueryResult";
import {
  IndexFilter,
  StringFilterValue,
  NumberFilterValue,
  MinMaxFilterValue,
  RefinerOption,
  QueryCriteria,
} from "refinerdb";
import useRefinerDB from "./useRefinerDB";
import { useCallback, useMemo, useState, useEffect } from "react";
import useDebounce from "./useDebounce";
import useCriteria from "./useCriteria";

export interface RefinerConfig {
  debounce: number;
}
const defaultConfig: RefinerConfig = {
  debounce: 250,
};
export type FilterValueType = MinMaxFilterValue | StringFilterValue | NumberFilterValue;
export default function useRefiner<T extends FilterValueType>(key: string, config = defaultConfig) {
  let refinerDB = useRefinerDB();
  let result = useQueryResult();

  let criteria = useCriteria();
  console.log("Criteria", criteria);
  let filterValue = getFilterValue(criteria, key);

  let updateCriteria = useCallback(
    (newVal: T) => {
      if (!criteria.filter) {
        criteria.filter = {};
      }
      criteria.filter[key] = newVal;
      if (!criteria.filter[key]) {
        delete criteria.filter[key];
      }
      refinerDB.setCriteria(criteria);
    },
    [criteria, refinerDB, key]
  );

  let [value, setValue] = useState<T>(() => getFilterValue(criteria, key));

  useEffect(() => {
    console.log("NEW FILTER VALUE?", filterValue);
    setValue(filterValue);
  }, [filterValue]);

  useDebounce(
    () => {
      updateCriteria(value);
    },
    config.debounce,
    [value]
  );

  return {
    value,
    options: result && result.refiners ? result.refiners[key] : [],
    setValue,
  };
}

let getFilterValue = (criteria: QueryCriteria, key: string): any => {
  if (!criteria || !criteria.filter) return null;
  return criteria.filter[key];
};
