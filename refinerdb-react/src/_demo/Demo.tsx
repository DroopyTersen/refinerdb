import React from "react";
import { IndexConfig, IndexType } from "refinerdb";
import RefinerDBProvider from "RefinerDBProvider";
import Header from "./Header";
import ResultInspector from "components/results/ResultInspector";
import Textbox from "components/refinerControls/Textbox";
import SingleValueDropdown from "components/refinerControls/SingleValueDropdown";
import NumberRangeRefiner from "components/refinerControls/NumberRangeRefiner";
import useRefinerDB from "hooks/useRefinerDB";
import useIndexes from "hooks/useIndexes";
import useQueryResult from "hooks/useQueryResult";

function Demo({ dbName, title, indexes, getItems, renderItem, renderRefiners }: DemoProps) {
  return (
    <RefinerDBProvider name={dbName} workerPath={"/refinerdb.worker.js"}>
      <div className="App">
        <Header title={title}>
          <DataSetup indexes={indexes} getItems={getItems} />
          <ResultInspector />
        </Header>
        <div className="rdb-refiners">{renderRefiners()}</div>
        <div className="rdb-item-results">
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
      let items = await getItems();
      refinerDB.setItems(items);
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
  getItems: () => Promise<any[]>;
  renderItem: (item: any) => JSX.Element;
  renderRefiners: () => JSX.Element;
}
