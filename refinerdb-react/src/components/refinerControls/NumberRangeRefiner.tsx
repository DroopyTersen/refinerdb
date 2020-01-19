import React, { useState, useCallback } from "react";
import useRefiner from "hooks/useRefiner";
import { MinMaxFilterValue } from "refinerdb";
import useDebounce from "hooks/useDebounce";

function NumberRangeRefiner({ indexKey, label, delay = 500 }: NumberRangeRefinerProps) {
  let refiner = useRefiner(indexKey);
  let [range, setRange] = useState<MinMaxFilterValue>(
    refiner && refiner.filter ? (refiner.filter as MinMaxFilterValue) : { min: "", max: "" }
  );

  useDebounce(() => refiner.update(range), delay, [range]);

  const onChange = useCallback(
    function(key, val) {
      setRange((prev) => ({
        ...prev,
        [key]: val,
      }));
    },
    [setRange]
  );

  if (!refiner || !refiner.options) {
    return null;
  }

  return (
    <div className="rdb-refiner range number-range">
      <label>{label || indexKey}</label>
      <div className="">
        <input
          placeholder="Min"
          value={range.min + ""}
          onChange={(e) => onChange("min", e.currentTarget.valueAsNumber)}
          type="number"
        />
        <input
          placeholder="Max"
          value={range.max + ""}
          onChange={(e) => onChange("max", e.currentTarget.valueAsNumber)}
          type="number"
        />
      </div>
    </div>
  );
}

export default React.memo(NumberRangeRefiner);

export interface NumberRangeRefinerProps {
  indexKey: string;
  label?: string;
  delay?: number;
}
