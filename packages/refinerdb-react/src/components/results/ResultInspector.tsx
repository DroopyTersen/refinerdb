import React from "react";
import { ObjectInspector, TableInspector } from "react-inspector";
import useQueryResult from "../../hooks/useQueryResult";

function ResultInspector({ hydrateItems = true }: ResultInspectorProps) {
  let result = useQueryResult({ hydrateItems });

  if (!result) return null;
  return (
    <div className="rdb-results-inspector">
      <ObjectInspector data={result} />
    </div>
  );
}

export default React.memo(ResultInspector);

export interface ResultInspectorProps {
  hydrateItems?: boolean;
}
