import React from "react";
import { useSort } from "../../hooks";

export default function SortControl() {
  let sort = useSort();
  return (
    <div className="rdb-sort" style={{ display: "flex" }}>
      <select value={sort.sortKey} onChange={(e) => sort.setSortKey(e.currentTarget.value)}>
        {sort.options.map((o) => (
          <option value={o.value}>{o.text}</option>
        ))}
      </select>
      <button
        style={{ marginLeft: "5px" }}
        className="button-outline"
        title="Toggle sort direction"
        onClick={(e) => sort.toggleDir()}
      >
        {sort.sortDir}
      </button>
    </div>
  );
}
