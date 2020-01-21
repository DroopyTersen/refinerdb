import React, { useState, useCallback } from "react";
import useRefiner from "../../hooks/useRefiner";
import { MinMaxFilterValue } from "refinerdb";
import useDebounce from "../../hooks/useDebounce";

function Textbox({ indexKey, label, delay = 500 }: TextboxProps) {
  let refiner = useRefiner(indexKey);

  let [value, setValue] = useState(refiner && refiner.filter ? (refiner.filter as string) : "");

  useDebounce(
    () => {
      refiner.update(value ? value + "*" : "");
    },
    delay,
    [value]
  );

  return (
    <div>
      <label>{label || indexKey}</label>
      <input type="text" value={value} onChange={(e) => setValue(e.currentTarget.value)} />
    </div>
  );
}

export default React.memo(Textbox);

export interface TextboxProps {
  indexKey: string;
  label?: string;
  delay?: number;
}
