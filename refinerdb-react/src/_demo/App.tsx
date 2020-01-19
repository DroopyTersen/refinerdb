import React, { useEffect } from "react";
import RefinerDBProvider from "RefinerDBProvider";
import Header from "./Header";
import useIndexes from "hooks/useIndexes";
import { IndexType } from "refinerdb";
import useRefinerDB from "hooks/useRefinerDB";
import useQueryResult from "hooks/useQueryResult";
import { ObjectInspector, TableInspector } from "react-inspector";
import useRefiner from "hooks/useRefiner";
const App: React.FC = () => {
  return (
    <RefinerDBProvider name="demo-app" workerPath={"/refinerdb.worker.js"}>
      <div className="App">
        <Header />
        <IndexesSetup />
        <RefinerDropdown indexKey="ethnicity" />
        <Results />
        <DataSetup />
        <Content />
      </div>
    </RefinerDBProvider>
  );
};

function RefinerDropdown({ indexKey }) {
  let refiner = useRefiner(indexKey);

  if (!refiner || !refiner.options) {
    return null;
  }
  let handleChange = (e) => {
    refiner.update(e.currentTarget.value);
    console.log();
  };

  return (
    <>
      <select onChange={handleChange}>
        <option key="blank" value="">
          Filter by {indexKey}
        </option>
        {refiner.options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.key} - {option.count}
          </option>
        ))}
      </select>
    </>
  );
}
function Results() {
  let result = useQueryResult();

  if (!result) return null;
  return <ObjectInspector data={result} />;
  // return <pre>{JSON.stringify(result, null, 2)}</pre>;
}
function IndexesSetup() {
  let [indexes, setIndexes] = useIndexes();
  console.log("RENDERING IndexesSetup");
  useEffect(() => {
    if (setIndexes) {
      setIndexes([
        { key: "birthYear", hashFn: (item) => item.birthYear, type: "number" },
        { key: "ethnicity", hashFn: (item) => item.ethnicity, type: "string" },
        { key: "gender", hashFn: (item) => item.gender, type: "string" },
        { key: "firstName", hashFn: (item) => item.firstName, type: "string" },
        { key: "rank", hashFn: (item) => item.rank, type: "number" },
      ]);
    }
  }, [setIndexes]);
  return null;
}

function DataSetup() {
  let refinerDB = useRefinerDB();

  const refreshData = async () => {
    if (refinerDB) {
      let babyNames = await fetch("/babyNames.json").then((data) => data.json());
      refinerDB.setItems(babyNames);
    }
  };

  return (
    <button type="button" onClick={refreshData}>
      Refresh Data
    </button>
  );
}

function Content() {
  console.log("RENDERING Content");
  return <div>Hi there, I am content</div>;
}

export default App;
