import React from "react";
import useRefiner from "hooks/useRefiner";

function SingleValueDropdown({ indexKey, label }: SingleValueDropdownProps) {
  let refiner = useRefiner(indexKey);

  if (!refiner || !refiner.options) {
    return null;
  }
  let handleChange = (e) => {
    refiner.update(e.currentTarget.value);
    console.log();
  };
  return (
    <>
      <label>{label || indexKey}</label>
      <select onChange={handleChange}>
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
