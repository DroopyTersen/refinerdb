import React from "react";
import { useDateRangeRefiner } from "../../hooks/useDateRangeRefiner";
import { Fieldset } from "./Fieldset";

interface Props {
  indexKey: string;
  label?: string;
  debounce?: number;
}

function DateRangeRefiner({ indexKey, label, debounce = 500 }: Props) {
  let range = useDateRangeRefiner(indexKey, debounce);

  return (
    <Fieldset label={label || indexKey}>
      <div className="">
        <input
          placeholder="Min"
          value={range.min}
          onChange={(e) => range.setMin(e.currentTarget.valueAsDate)}
          type="date"
          style={{ width: "100%" }}
        />
        <div>to</div>
        <input
          placeholder="Max"
          value={range.max}
          onChange={(e) => range.setMax(e.currentTarget.valueAsDate)}
          type="date"
          style={{ width: "100%" }}
        />
      </div>
    </Fieldset>
  );
}

export default React.memo(DateRangeRefiner);
