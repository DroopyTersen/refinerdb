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
      </div>
      <div>
        <h2 style={{ margin: "0" }}>Results</h2>
      </div>
    </div>
  );
}
export const Basic = () => {
  return (
    <DemoSetup dbName="movies-and-tv" indexes={movieIndexes} getItems={getMoviesAndTv}>
      <App />
    </DemoSetup>
  );
};
