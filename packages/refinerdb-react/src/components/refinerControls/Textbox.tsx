import React, { useCallback } from "react";
import { useTextRefiner } from "../../hooks/useTextRefiner";
import { Fieldset } from "./Fieldset";

function Textbox({ indexKey, label, debounce = 500 }: TextboxProps) {
  let { value = "", setValue } = useTextRefiner(indexKey, debounce);

  return (
    <label className="form-label">
      {label || indexKey}
      <input
        className="form-input"
        type="text"
        value={value || ""}
        style={{ width: "100%", boxSizing: "border-box" }}
        onChange={(e) => setValue(e.currentTarget.value)}
      />
    </label>
  );
}

export default React.memo(Textbox);

export interface TextboxProps {
  indexKey: string;
  label?: string;
  debounce?: number;
}
