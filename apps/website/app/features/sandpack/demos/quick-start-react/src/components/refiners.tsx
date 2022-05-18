import {
  useFilter,
  useMultiselectRefiner,
  useNumberRangeRefiner,
  useTextRefiner,
} from "refinerdb-react";

export function ClearRefinersButton() {
  let { filter, clearFilter } = useFilter();
  if (Object.keys(filter).length < 1) return null;
  return (
    <button type="button" onClick={clearFilter} className="pseudo error">
      Clear
    </button>
  );
}
export function TitleRefiner() {
  let { value = "", setValue } = useTextRefiner("title");

  return (
    <label>
      Title
      <input value={value || ""} onChange={(e) => setValue(e.currentTarget.value)} />
    </label>
  );
}

export function GenreRefiner() {
  let { getCheckboxProps, options } = useMultiselectRefiner("genre");

  return (
    <div>
      <label>Genre</label>
      {options.map((option) => (
        <div key={option.key}>
          <label>
            <input {...getCheckboxProps(option)} />
            <span className="checkable">
              {option.key} ({option.count})
            </span>
          </label>
        </div>
      ))}
    </div>
  );
}

export function YearRefiner() {
  let { getCheckboxProps, options } = useMultiselectRefiner("year", {
    sort: "count",
  });

  return (
    <div>
      <label>Year</label>
      {options.slice(0, 6).map((option) => (
        <div key={option.key}>
          <label>
            <input {...getCheckboxProps(option)} />
            <span className="checkable">
              {option.key} ({option.count})
            </span>
          </label>
        </div>
      ))}
    </div>
  );
}

export function ScoreRefiner() {
  let range = useNumberRangeRefiner("score");

  return (
    <label>
      Score (out of 10)
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
        />
        <input
          placeholder="Max"
          value={(range?.max && range?.max + "") || ""}
          onChange={(e) => range.setMax(e.currentTarget.value)}
          type="number"
        />
      </div>
    </label>
  );
}
