import React, { useCallback } from "react";
import { useRefiner } from "../../hooks/useRefiner";

function SingleValueDropdown({ indexKey, label }: SingleValueDropdownProps) {
  let [value = "", setValue, options = []] = useRefiner<string>(indexKey, { debounce: 0 });

  let handleChange = useCallback(
    (e) => {
      setValue(e.currentTarget.value);
    },
    [setValue]
  );

  return (
    <label style={{ width: "100%" }}>
      {label || indexKey}
      <br />
      <select onChange={handleChange} value={value + ""} style={{ width: "100%" }}>
        <option key="blank" value="">
          All
        </option>
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.key} - {option.count}
          </option>
        ))}
      </select>
    </label>
  );
}

export default React.memo(SingleValueDropdown);

export interface SingleValueDropdownProps {
  indexKey: string;
  label?: string;
}
