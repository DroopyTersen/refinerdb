import React, { useCallback } from "react";
import useRefiner from "../../hooks/useRefiner";

function SingleValueDropdown({ indexKey, label }: SingleValueDropdownProps) {
  let { value = "", setValue, options = [] } = useRefiner<string>(indexKey, { debounce: 0 });

  let handleChange = useCallback(
    (e) => {
      setValue(e.currentTarget.value);
    },
    [setValue]
  );

  return (
    <>
      <label>{label || indexKey}</label>
      <select onChange={handleChange} value={value + ""}>
        <option key="blank" value="">
          All
        </option>
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.key} - {option.count}
          </option>
        ))}
      </select>
    </>
  );
}

export default React.memo(SingleValueDropdown);

export interface SingleValueDropdownProps {
  indexKey: string;
  label?: string;
}
