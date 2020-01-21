import React, { useState, useCallback } from "react";
import useRefiner from "../../hooks/useRefiner";
import { MinMaxFilterValue } from "refinerdb";
import useDebounce from "../../hooks/useDebounce";

function NumberRangeRefiner({ indexKey, label, debounce = 500 }: NumberRangeRefinerProps) {
  let refiner = useRefiner<MinMaxFilterValue>(indexKey, { debounce });

  const onChange = useCallback(
    function(key, val) {
      refiner.setValue((prev) => ({
        ...prev,
        [key]: val,
      }));
    },
    [refiner.setValue]
  );

  if (!refiner || !refiner.options) {
    return null;
  }
  let range = {
    min: "",
    max: "",
    ...refiner.value,
  };

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
  debounce?: number;
}
