import React, { useEffect } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import {
  RefinerDBProvider,
  useRefinerDB,
  IndexType,
  useIndexes,
  ClearRefinersButton,
  Textbox,
  SingleValueDropdown,
  NumberRangeRefiner,
  useQueryResult,
} from "..";
import type { IndexConfig } from "..";
import movies from "../demo/movies/fixtures/movies";
import { DataSetupButton } from "../demo/DataSetupButton";
import { movieIndexes } from "../demo/movies/movies.indexes";
import { getMoviesAndTv } from "../demo/movies/movies.data";
import { DemoSetup } from "../demo/DemoSetup";

export default {
  title: "Full Demos/Movies & TV",
  component: RefinerDBProvider,
} as ComponentMeta<typeof RefinerDBProvider>;

function App() {
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem", marginTop: "2rem" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <RefinerPanel />
      </div>
      <div>
        <ResultsView />
      </div>
    </div>
  );
}

function RefinerPanel() {
  return (
    <>
      <h2 style={{ margin: "0" }}>Refiners</h2>
      <div>
        <ClearRefinersButton>CLEAR</ClearRefinersButton>
      </div>
      <div>
        <Textbox indexKey="title" label="Title" debounce={300} />
      </div>
      <div>
        <SingleValueDropdown indexKey="type" label="Type" />
      </div>
      <div>
        <SingleValueDropdown indexKey="genre" label="Genre" />
      </div>
      <div>
        <NumberRangeRefiner indexKey="score" label="Score" debounce={200} />
      </div>
    </>
  );
}

function ResultsView() {
  let results = useQueryResult();
  console.log;
  if (!results) return <div>Loading...</div>;
  return (
    <>
      <h2 style={{ margin: "0" }}>Results ({results?.totalCount})</h2>
      <div>
        {results?.items
          ?.slice(0, 25)
          ?.filter((item) => item.__itemId)
          ?.map((item) => (
            <div key={item.__itemId}>{item.title}</div>
          ))}
      </div>
      {results.totalCount > 25 && <div>...</div>}
    </>
  );
}
export const Basic = () => {
  return (
    <DemoSetup dbName="movies-and-tv" indexes={movieIndexes} getItems={getMoviesAndTv}>
      <App />
    </DemoSetup>
  );
};
