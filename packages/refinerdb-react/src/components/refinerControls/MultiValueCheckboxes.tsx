import React, { useCallback } from "react";
import { useMultiselectRefiner } from "../../hooks/useMultiselectRefiner";
import { Fieldset } from "./Fieldset";

export interface Props {
  indexKey: string;
  label?: string;
}

function MultiValueCheckboxes({ indexKey, label = "" }: Props) {
  let { getCheckboxProps, options } = useMultiselectRefiner(indexKey, 0);

  return (
    <div className="form-group">
      <label className="form-label">{label || indexKey}</label>
      {options.map((option) => (
        <label key={option.key} className="form-checkbox">
          <input {...getCheckboxProps(option)} />
          <i className="form-icon"></i> {option.key} - {option.count}
        </label>
      ))}
    </div>
  );
}

export default React.memo(MultiValueCheckboxes);
