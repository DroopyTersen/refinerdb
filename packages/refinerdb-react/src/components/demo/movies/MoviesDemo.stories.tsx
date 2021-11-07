import React, { useEffect } from "react";
import { ComponentMeta } from "@storybook/react";

import { RefinerDBProvider, useQueryResult } from "../../..";
import { movieIndexes } from "./movies.indexes";
import { getMoviesAndTv } from "./movies.data";
import { DemoSetup } from "../DemoSetup";
import MultiValueSelect from "../../refinerControls/MultiValueSelect";
import DateRangeRefiner from "../../refinerControls/DateRangeRefiner";
import MultiValueCheckboxes from "../../refinerControls/MultiValueCheckboxes";
import { ClearRefinersButton, NumberRangeRefiner, Textbox } from "../../refinerControls";
import movies from "./fixtures/movies";
import tvShows from "./fixtures/tvShows";

export default {
  title: "Full Demos/Movies & TV",
  component: RefinerDBProvider,
} as ComponentMeta<typeof RefinerDBProvider>;

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
        <MultiValueCheckboxes indexKey="type" label="Type" />
      </div>
      <div>
        <MultiValueSelect indexKey="genre" label="Genres" />
      </div>
      <div>
        <DateRangeRefiner indexKey="released" label="Release Date" />
      </div>
      <div>
        <NumberRangeRefiner indexKey="score" label="Score" debounce={200} />
      </div>
    </>
  );
}

function ResultsViewWithHydratedItems() {
  let results = useQueryResult();
  if (!results) return <div>Loading...</div>;
  return (
    <>
      <h2 style={{ margin: "0" }}>Results ({results?.totalCount})</h2>
      <ItemsList items={results?.items} />
      {results.totalCount > 25 && <div>...</div>}
    </>
  );
}

function ResultsViewSkipHydrateItems() {
  let results = useQueryResult({ hydrateItems: false });
  if (!results) return <div>Loading...</div>;
  let items = results?.itemIds
    .slice(0, 25)
    .map((id) => movies.find((m) => m.id === id) || tvShows.find((t) => t.id === id))
    .filter(Boolean);
  return (
    <>
      <h2 style={{ margin: "0" }}>Results ({results?.totalCount})</h2>
      <ItemsList items={items} />
      {results.totalCount > 25 && <div>...</div>}
    </>
  );
}

function ItemsList({ items }) {
  if (!items) return null;
  return (
    <div>
      {items
        ?.slice(0, 25)
        ?.filter((item) => item.id)
        ?.map((item) => (
          <div key={item.id}>{item.title}</div>
        ))}
    </div>
  );
}
export const Basic = () => {
  return (
    <DemoSetup dbName="movies-and-tv" indexes={movieIndexes} getItems={getMoviesAndTv}>
      <div
        style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem", marginTop: "2rem" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "250px" }}>
          <RefinerPanel />
        </div>
        <div>
          <ResultsViewWithHydratedItems />
        </div>
      </div>
    </DemoSetup>
  );
};

export const SkipHydrateItems = () => {
  return (
    <DemoSetup
      dbName="movies-and-tv"
      indexes={movieIndexes}
      getItems={getMoviesAndTv}
      hydrateItems={false}
    >
      <div
        style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem", marginTop: "2rem" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "250px" }}>
          <RefinerPanel />
        </div>
        <div>
          <ResultsViewSkipHydrateItems />
        </div>
      </div>
    </DemoSetup>
  );
};
