import { useMemo } from "react";
import { MinMaxFilterValue } from "refinerdb";
import { useRefiner } from "./useRefiner";

export function useDateRangeRefiner(indexKey: string, debounce = 500) {
  let [value, setValue] = useRefiner<MinMaxFilterValue>(indexKey, { debounce });

  let actions = useMemo(() => {
    const update = (key: string, val: string | Date) => {
      setValue((prev) => ({ ...prev, [key]: val }));
    };

    return {
      setMin: (val: Date | string) => update("min", val),
      setMax: (val: Date | string) => update("max", val),
    };
  }, [setValue]);

  return {
    min: value?.min ? formatDateForInput(value.min) : "",
    max: value?.max ? formatDateForInput(value.max) : "",
    ...actions,
  };
}

export const formatDateForInput = (dateish) => {
  var d = new Date(dateish),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};
