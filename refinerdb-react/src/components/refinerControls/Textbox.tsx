import React, { useState, useCallback } from "react";
import useRefiner from "../../hooks/useRefiner";

function Textbox({ indexKey, label, debounce = 500 }: TextboxProps) {
  let refiner = useRefiner(indexKey, { debounce });
  console.log("TCL: Textbox -> Textbox", indexKey, refiner.value);

  let onChange = useCallback(
    (e) => {
      let val = e.currentTarget.value;
      if (val) val += "*";
      refiner.setValue(val ? val : "");
    },
    [refiner.setValue]
  );

  return (
    <div>
      <label>{label || indexKey}</label>
      <input
        type="text"
        value={(refiner.value ? refiner.value + "" : "").replace("*", "")}
        onChange={onChange}
      />
    </div>
  );
}

export default React.memo(Textbox);

export interface TextboxProps {
  indexKey: string;
  label?: string;
  debounce?: number;
}
