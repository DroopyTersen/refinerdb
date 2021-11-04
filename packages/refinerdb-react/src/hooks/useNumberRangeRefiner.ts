import { useMemo } from "react";
import { MinMaxFilterValue } from "refinerdb";
import { useRefiner } from ".";

export function useNumberRangeRefiner(indexKey: string, debounce = 500) {
  let [value, setValue] = useRefiner<MinMaxFilterValue>(indexKey, { debounce });

  let actions = useMemo(() => {
    const update = (key: string, val: string | number) => {
      let value = val;
      console.log("🚀 | update | value", value, typeof value);

      if (typeof value === "string") {
        value = parseFloat(value);
      }
      setValue((prev) => ({ ...prev, [key]: value }));
    };

    return {
      setMin: (val: number | string) => update("min", val),
      setMax: (val: number | string) => update("max", val),
    };
  }, [setValue]);

  return {
    min: value?.min,
    max: value?.max,
    ...actions,
  };
}
