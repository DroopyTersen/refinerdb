import React from "react";
import RefinerDB, { IndexConfig } from "refinerdb";
import {
  RefinerDBProvider,
  ResultInspector,
  useQueryResult,
  useRefinerDB,
  useIndexes,
  ClearRefinersButton,
  SortControl,
} from "refinerdb-react";
import Header from "components/Header";
// eslint-disable-next-line import/no-webpack-loader-syntax
const RefinerWorker = require("worker-loader!../../node_modules/refinerdb/lib/workers/refinerdb.worker.js");
let worker = new RefinerWorker();
console.log("REFINER WORKER", RefinerWorker, worker);
function Demo({ dbName, title, indexes, getItems, renderItem, renderRefiners }: DemoProps) {
  return (
    <RefinerDBProvider name={dbName} worker={worker}>
      <div className="App">
        <Header title={title}>
          <DataSetup indexes={indexes} getItems={getItems} />
          <ResultInspector />
        </Header>
        <div className="rdb-refiners">
          <ClearRefinersButton className="button-clear">Clear All</ClearRefinersButton>
          {renderRefiners()}
        </div>
        <div className="rdb-item-results">
          <SortControl />
          <ItemResults renderItem={renderItem} />
        </div>
      </div>
    </RefinerDBProvider>
  );
}

function ItemResults({ renderItem }) {
  let result = useQueryResult();
  if (!result || !result.items) return null;
  return <div className="card-stack">{result.items.slice(0, 50).map(renderItem)}</div>;
}

export const RefinerPanel: React.FC = ({ children }) => {
  return <div className="rdb-refiners">{children}</div>;
};

function DataSetup({ indexes, getItems }) {
  let refinerDB = useRefinerDB();
  useIndexes(indexes);

  const refreshData = async () => {
    if (refinerDB) {
      await getItems(refinerDB);
    }
  };

  return (
    <button type="button" onClick={refreshData} style={{ margin: "10px 0 65px 0" }}>
      Refresh Data
    </button>
  );
}

export default React.memo(Demo);

export interface DemoProps {
  dbName: string;
  title: string;
  indexes: IndexConfig[];
  getItems: (db: RefinerDB) => void;
  renderItem: (item: any) => JSX.Element;
  renderRefiners: () => JSX.Element;
}
