import { ObjectInspector } from "react-inspector";
import { useQueryResult } from "refinerdb-react";
import { ClearRefinersButton } from "./refiners";

export function ResultsView() {
  let result = useQueryResult();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ margin: "0" }}>Results</h2>
        <ClearRefinersButton />
      </div>

      <div>
        <code>result?.refiners</code>
        <ObjectInspector data={result?.refiners} />
      </div>

      <div>
        <code>result?.items ({result?.totalCount})</code>
        <ObjectInspector data={result?.items} />
      </div>

      <pre>
        <code>criteria: {JSON.stringify(JSON.parse(result?.key || "{}"), null, 2)}</code>
      </pre>
    </div>
  );
}
