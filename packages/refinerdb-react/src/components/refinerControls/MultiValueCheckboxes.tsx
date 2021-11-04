import React, { useCallback } from "react";
import { useMultiselectRefiner } from "../../hooks/useMultiselectRefiner";
import { Fieldset } from "./Fieldset";

export interface Props {
  indexKey: string;
  label?: string;
}

function MultiValueCheckboxes({ indexKey, label = "" }: Props) {
  let [values = [], , options = [], events] = useMultiselectRefiner(indexKey, 0);

  return (
    <Fieldset label={label || indexKey}>
      {options.map((option) => (
        <div key={option.key}>
          <label>
            <input
              type="checkbox"
              value={option.key}
              checked={values.includes(option.key)}
              onChange={events.checkboxOnChange}
            />
            {option.key} - {option.count}
          </label>
        </div>
      ))}
    </Fieldset>
  );
}

export default React.memo(MultiValueCheckboxes);
