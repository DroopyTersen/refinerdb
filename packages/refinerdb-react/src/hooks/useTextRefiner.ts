import { useCallback } from "react";
import { useRefiner } from ".";

/** Appends the refiner value with an asterisk to perform a "Contains" query */
export function useTextRefiner(indexKey, debounce = 500) {
  let [refinerValue, setRefinerValue] = useRefiner<string>(indexKey, { debounce });
  let setValue = useCallback(
    (newValue: string) => {
      // Append an asterisk to tell RefinerDB to do a contains filter
      if (newValue && newValue[newValue.length - 1] !== "*") {
        newValue += "*";
      }
      setRefinerValue(newValue || "");
    },
    [setRefinerValue]
  );
  return {
    value: refinerValue?.replace("*", "") || "",
    setValue,
  };
}
