import { useMemo } from "react";
import { RefinerOption } from "refinerdb";
import { useRefiner } from "./useRefiner";

export interface MultiSelectRefinerOptions {
  /** Defaults to 100 */
  debounce?: number;
  /** Defaults to all */
  maxRefinersOptions?: number;
  /** Sort alphabetically or by count */
  sort?: "alpha" | "count";
}

const defaultOptions: MultiSelectRefinerOptions = {
  debounce: 100,
  sort: "alpha",
};

export function useMultiselectRefiner(
  indexKey: string,
  refinerOptions?: MultiSelectRefinerOptions
) {
  let { debounce, sort, maxRefinersOptions } = {
    ...defaultOptions,
    ...refinerOptions,
  };
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

  // TODO: make sure selected values are included if sliced
  let processedOptions = useMemo(() => {
    return [...options]
      .sort((a, b) => {
        if (sort === "count" && a.count !== undefined) {
          return b.count - a.count;
        }
        return a.key.localeCompare(b.key);
      })
      .slice(0, maxRefinersOptions || options.length + 1);
  }, [options, sort, maxRefinersOptions]);

  return {
    values,
    setValues,
    options: processedOptions,
    ...propGetters,
  };
}
