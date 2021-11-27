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
        <label key={option.key} className="form-checkbox">
          <input {...getCheckboxProps(option)} />
          <span>
            {option.key} ({option.count})
          </span>
        </label>
      ))}
    </div>
  );
}

export default React.memo(MultiValueCheckboxes);
