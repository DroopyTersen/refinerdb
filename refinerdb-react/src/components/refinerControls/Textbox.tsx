import React, { useCallback } from "react";
import useRefiner from "../../hooks/useRefiner";

function Textbox({ indexKey, label, debounce = 500 }: TextboxProps) {
  let { value = "", setValue } = useRefiner<string>(indexKey, { debounce });

  let onChange = useCallback(
    (e) => {
      let val = e.currentTarget.value;
      if (val) val += "*";
      setValue(val ? val : "");
    },
    [setValue]
  );

  return (
    <div>
      <label>{label || indexKey}</label>
      <input type="text" value={(value || "").replace("*", "")} onChange={onChange} />
    </div>
  );
}

export default React.memo(Textbox);

export interface TextboxProps {
  indexKey: string;
  label?: string;
  debounce?: number;
}
