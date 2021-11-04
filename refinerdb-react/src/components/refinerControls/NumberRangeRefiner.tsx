import React, { useState, useCallback } from "react";
import useRefiner from "../../hooks/useRefiner";
import { MinMaxFilterValue } from "refinerdb";

function NumberRangeRefiner({ indexKey, label, debounce = 500 }: NumberRangeRefinerProps) {
  let { setValue, value } = useRefiner<MinMaxFilterValue>(indexKey, { debounce });

  const onChange = useCallback(
    function (key, val) {
      setValue((prev) => ({
        ...prev,
        [key]: val,
      }));
    },
    [setValue]
  );

  let range = {
    min: "",
    max: "",
    ...value,
  };

  return (
    <div className="rdb-refiner range number-range">
      <label>
        {label || indexKey}
        <div className="">
          <input
            placeholder="Min"
            value={range.min + ""}
            onChange={(e) => onChange("min", e.currentTarget.valueAsNumber)}
            type="number"
            style={{ width: "5rem" }}
          />
          <input
            placeholder="Max"
            value={range.max + ""}
            onChange={(e) => onChange("max", e.currentTarget.valueAsNumber)}
            type="number"
            style={{ width: "5rem" }}
          />
        </div>
      </label>
    </div>
  );
}

export default React.memo(NumberRangeRefiner);

export interface NumberRangeRefinerProps {
  indexKey: string;
  label?: string;
  debounce?: number;
}
