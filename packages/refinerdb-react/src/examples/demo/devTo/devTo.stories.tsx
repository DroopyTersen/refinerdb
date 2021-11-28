import { ComponentMeta } from "@storybook/react";
import React from "react";
import { RefinerDBProvider, useQueryResult } from "../../..";
import { ClearRefinersButton, NumberRangeRefiner, Textbox } from "../../refinerControls";
import DateRangeRefiner from "../../refinerControls/DateRangeRefiner";
import MultiValueCheckboxes from "../../refinerControls/MultiValueCheckboxes";
import { DemoSetup } from "../DemoSetup";
import { devToIndexes, getDevToArticles } from "./devTo.data";

export default {
  title: "Full Demos/Dev.to Articles",
  component: RefinerDBProvider,
} as ComponentMeta<typeof RefinerDBProvider>;

export const JavascriptArticles = () => {
  return (
    <DemoSetup
      dbName="devto-articles"
      indexes={devToIndexes}
      getItems={() => getDevToArticles("javascript")}
      criteria={{ limit: 25 }}
    >
      <div className="layout">
        <div className="refiner-panel">
          <RefinerPanel />
        </div>
        <div className="results-view">
          <ResultsView />
        </div>
      </div>
    </DemoSetup>
  );
};

function ItemResult({ item }) {
  return (
    <div className="card">
      <img
        className="img-responsive"
        src={item.image || "https://thepracticaldev.s3.amazonaws.com/i/6hqmcjaxbgbon8ydw93z.png"}
        alt="Cover Image"
      />
      <footer className="card-header">
        <div>
          <a href={item.url} target="_blank">
            <h4>{item.title}</h4>
          </a>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="chip">{item?.user?.name}</div>
          <div className="mt-1 text-muted text-small">{item.published_date}</div>
        </div>
        <p className="card-body text-small">{item.description}</p>
      </footer>
    </div>
  );
}

function ResultsView() {
  let results = useQueryResult();
  if (!results) return <div>Loading...</div>;
  return (
    <>
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr)",
        }}
      >
        {results.items.map((item) => (
          <ItemResult key={item.id} item={item} />
        ))}
      </div>
      {results.totalCount > 25 && <div>...</div>}
    </>
  );
}
function RefinerPanel() {
  return (
    <>
      <h2 style={{ margin: "0" }}>Refiners</h2>

      <ClearRefinersButton style={{ position: "absolute", right: "0", top: ".5rem" }}>
        CLEAR
      </ClearRefinersButton>
      <Textbox indexKey="title" label="Title" debounce={300} />
      <MultiValueCheckboxes
        indexKey="tag_list"
        label="Tags"
        options={{ debounce: 0, maxRefinersOptions: 6, sort: "count" }}
      />
      <Textbox indexKey="author" label="Author" debounce={300} />
      <div>
        <DateRangeRefiner indexKey="published_timestamp" label="Published" />
        <div style={{ marginTop: "1rem" }}>
          <MultiValueCheckboxes
            indexKey="published_date"
            label=""
            options={{ debounce: 0, maxRefinersOptions: 6, sort: "count" }}
          />
        </div>
      </div>

      <NumberRangeRefiner indexKey="reactions_count" label="Reactions" debounce={200} />
    </>
  );
}
