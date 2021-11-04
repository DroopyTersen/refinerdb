import { useCallback, useMemo } from "react";
import { useRefiner } from ".";

export function useMultiselectRefiner(indexKey: string, debounce = 100) {
  let [values = [], setValues, options = []] = useRefiner<string[]>(indexKey, { debounce });

  let events = useMemo(() => {
    const checkboxOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;
      let checked = event.target.checked;
      setValues((prev = []) => {
        let newValues = (prev || []).filter((v) => v !== value);
        if (checked) {
          newValues.push(value);
        }

        return newValues;
      });
    };
    const selectOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setValues(
        [...(event?.target?.options as any)]
          .filter(({ selected }) => selected)
          .map(({ value }) => value)
      );
    };
    return {
      checkboxOnChange,
      selectOnChange,
    };
  }, [setValues]);

  return [values, setValues, options, events] as [
    typeof values,
    typeof setValues,
    typeof options,
    typeof events
  ];
}
