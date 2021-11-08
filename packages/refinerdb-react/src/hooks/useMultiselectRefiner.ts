import { useCallback, useMemo } from "react";
import { RefinerOption } from "refinerdb";
import { useRefiner } from ".";

export function useMultiselectRefiner(indexKey: string, debounce = 100) {
  let [values = [], setValues, options = []] = useRefiner<string[]>(indexKey, { debounce });

  let propGetters = useMemo(() => {
    let getCheckboxProps = (option: RefinerOption) => {
      return {
        type: "checkbox",
        value: option.key,
        checked: values.includes(option.key),
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          let value = event.target.value;
          let checked = event.target.checked;
          setValues((prev = []) => {
            let newValues = (prev || []).filter((v) => v !== value);
            if (checked) {
              newValues.push(value);
            }

            return newValues;
          });
        },
      };
    };
    const getSelectProps = () => {
      return {
        value: values,
        multiple: true,
        onChange: (event: React.ChangeEvent<HTMLSelectElement>) => {
          setValues(
            [...(event?.target?.options as any)]
              .filter(({ selected }) => selected)
              .map(({ value }) => value)
          );
        },
      };
    };
    return {
      getCheckboxProps,
      getSelectProps,
    };
  }, [setValues, values]);

  return {
    values,
    setValues,
    options,
    ...propGetters,
  };
}
