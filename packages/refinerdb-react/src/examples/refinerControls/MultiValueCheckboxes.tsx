import React from "react";
import {
  MultiSelectRefinerOptions,
  useMultiselectRefiner,
} from "../../hooks/useMultiselectRefiner";

export interface Props {
  indexKey: string;
  label?: string;
  options?: MultiSelectRefinerOptions;
}

function MultiValueCheckboxes({ indexKey, label = "", ...props }: Props) {
  let { getCheckboxProps, options } = useMultiselectRefiner(indexKey, props.options);

  return (
    <div className="form-group">
      <label className="form-label">{label ?? indexKey}</label>
      {options.map((option) => (
        <div>
          <label key={option.key} style={{ display: "flex" }}>
            <input {...getCheckboxProps(option)} />
            <span className="checkable">
              {option.key} ({option.count})
            </span>
          </label>
        </div>
      ))}
    </div>
  );
}

export default React.memo(MultiValueCheckboxes);
