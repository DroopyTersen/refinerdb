import React, { useEffect } from "react";
import RefinerDBProvider from "RefinerDBProvider";
import Header from "./Header";
import useIndexes from "hooks/useIndexes";
import { IndexType } from "refinerdb";
import useRefinerDB from "hooks/useRefinerDB";
import useQueryResult from "hooks/useQueryResult";
import { ObjectInspector, TableInspector } from "react-inspector";
const App: React.FC = () => {
  return (
    <RefinerDBProvider name="demo-app">
      <div className="App">
        <Header />
        <IndexesSetup />
        <DataSetup />
        <Content />
        <Results />
      </div>
    </RefinerDBProvider>
  );
};

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

  useEffect(() => {
    console.log(refinerDB);
    if (refinerDB) {
      let doAsync = async () => {
        let babyNames = await fetch("/babyNames.json").then((data) => data.json());
        refinerDB.setItems(babyNames);
      };
      doAsync();
    }
  }, [refinerDB]);

  return null;
}
function Content() {
  console.log("RENDERING Content");
  return <div>Hi there, I am content</div>;
}

export default App;
