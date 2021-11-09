import React, { useCallback } from "react";
import {
  useMultiselectRefiner,
  MultiSelectRefinerOptions,
} from "../../hooks/useMultiselectRefiner";
import useRefiner from "../../hooks/useRefiner";

export interface Props {
  indexKey: string;
  label?: string;
  options?: MultiSelectRefinerOptions;
}

function MultiValueSelect({ indexKey, label, ...props }: Props) {
  let { options, getSelectProps } = useMultiselectRefiner(indexKey, props.options);

  return (
    <label className="form-label">
      {label || indexKey}
      <br />
      <select {...getSelectProps()} className="form-select" style={{ minHeight: "200px" }}>
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

export default React.memo(MultiValueSelect);
