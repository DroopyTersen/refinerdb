import React from "react";
import { useNumberRangeRefiner } from "../../hooks/useNumberRangeRefiner";

function NumberRangeRefiner({ indexKey, label, debounce = 500 }: NumberRangeRefinerProps) {
  let range = useNumberRangeRefiner(indexKey, debounce);

  return (
    <label className="form-label">
      {label || indexKey}
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: ".5rem",
          boxSizing: "border-box",
        }}
      >
        <input
          placeholder="Min"
          value={range.min + ""}
          onChange={(e) => range.setMin(e.currentTarget.value)}
          type="number"
          className="form-input"
        />
        <input
          placeholder="Max"
          value={(range?.max && range?.max + "") || ""}
          onChange={(e) => range.setMax(e.currentTarget.value)}
          type="number"
          className="form-input"
        />
      </div>
    </label>
  );
}

export default React.memo(NumberRangeRefiner);

export interface NumberRangeRefinerProps {
  indexKey: string;
  label?: string;
  debounce?: number;
}
