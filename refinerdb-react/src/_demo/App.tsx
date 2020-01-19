import React, { useEffect, useState } from "react";
import RefinerDBProvider from "RefinerDBProvider";
import Header from "./Header";
import useIndexes from "hooks/useIndexes";
import { IndexType, MinMaxFilterValue } from "refinerdb";
import useRefinerDB from "hooks/useRefinerDB";
import useQueryResult from "hooks/useQueryResult";
import { ObjectInspector, TableInspector } from "react-inspector";
import useRefiner from "hooks/useRefiner";
import { on } from "cluster";
import useDebounce from "hooks/useDebounce";
const App: React.FC = () => {
  return (
    <RefinerDBProvider name="demo-app" workerPath={"/refinerdb.worker.js"}>
      <div className="App">
        <Header />
        <IndexesSetup />
        <Textbox indexKey="firstName" />
        <RefinerDropdown indexKey="ethnicity" />
        <RefinerDropdown indexKey="gender" />
        <NumberRangeInput indexKey="birthYear" />
        <NumberRangeInput indexKey="rank" />
        <Results />
        <DataSetup />
        <Content />
      </div>
    </RefinerDBProvider>
  );
};

function Textbox({ indexKey }) {
  let refiner = useRefiner(indexKey);

  let [value, setValue] = useState(refiner && refiner.filter ? (refiner.filter as string) : "");

  useDebounce(
    () => {
      refiner.update(value + "*");
    },
    500,
    [value]
  );

  return (
    <div>
      <label>Filter by {indexKey}</label>
      <input type="text" value={value} onChange={(e) => setValue(e.currentTarget.value)} />
    </div>
  );
}

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

function NumberRangeInput({ indexKey }) {
  let refiner = useRefiner(indexKey);
  let [range, setRange] = useState<MinMaxFilterValue>(
    refiner && refiner.filter ? (refiner.filter as MinMaxFilterValue) : { min: "", max: "" }
  );

  useDebounce(
    () => {
      refiner.update(range);
    },
    500,
    [range]
  );
  if (!refiner || !refiner.options) {
    return null;
  }

  const onChange = function(key, val) {
    setRange((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  return (
    <div>
      <label>Filter by {indexKey}</label>
      <input
        placeholder="Min"
        value={range.min + ""}
        onChange={(e) => onChange("min", e.currentTarget.valueAsNumber)}
        type="number"
      />
      <input
        placeholder="Max"
        value={range.max + ""}
        onChange={(e) => onChange("max", e.currentTarget.valueAsNumber)}
        type="number"
      />
    </div>
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
        { key: "birthYear", type: "number" },
        { key: "ethnicity", type: "string" },
        { key: "gender", type: "string" },
        { key: "firstName", type: "string" },
        { key: "rank", type: "number" },
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
  let result = useQueryResult();
  if (!result || !result.items) return null;
  console.log("RENDERING Content");
  return (
    <div>
      {result.items.slice(0, 50).map((item) => {
        return (
          <article className="card">
            <header>
              <h4>{item.firstName}</h4>
            </header>
            <footer>
              <div>Rank: {item.rank}</div>
              <div>Year: {item.birthYear}</div>
              <div>Ethnicity: {item.ethnicity}</div>
            </footer>
          </article>
        );
      })}
    </div>
  );
}

export default App;
