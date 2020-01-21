import React, { useCallback } from "react";
import useRefiner from "../../hooks/useRefiner";

function SingleValueDropdown({ indexKey, label }: SingleValueDropdownProps) {
  let refiner = useRefiner(indexKey, { debounce: 0 });

  if (!refiner || !refiner.options) {
    return null;
  }
  let handleChange = useCallback(
    (e) => {
      refiner.setValue(e.currentTarget.value);
    },
    [refiner.setValue]
  );
  return (
    <>
      <label>{label || indexKey}</label>
      <select onChange={handleChange} value={refiner.value + ""}>
        <option key="blank" value="">
          All
        </option>
        {refiner.options.map((option) => (
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
