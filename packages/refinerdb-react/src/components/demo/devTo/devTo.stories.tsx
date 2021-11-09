import React, { useEffect } from "react";
import { ComponentMeta } from "@storybook/react";
import { RefinerDBProvider, useCriteria, useQueryResult } from "../../..";
import useAsyncData from "../useAsyncData";
import { devToIndexes, getDevToArticles } from "./devTo.data";
import { DemoSetup } from "../DemoSetup";
import { ClearRefinersButton, NumberRangeRefiner, Textbox } from "../../refinerControls";
import DateRangeRefiner from "../../refinerControls/DateRangeRefiner";
import MultiValueCheckboxes from "../../refinerControls/MultiValueCheckboxes";
import MultiValueSelect from "../../refinerControls/MultiValueSelect";

export default {
  title: "Full Demos/Dev.to Articles",
  component: RefinerDBProvider,
} as ComponentMeta<typeof RefinerDBProvider>;

export const JavascriptArticles = () => {
  let { data } = useAsyncData(getDevToArticles, ["javascript"], null);
  console.log("🚀 | JavascriptArticles | data", data);

  return (
    <DemoSetup
      dbName="devto-articles"
      indexes={devToIndexes}
      getItems={() => getDevToArticles("javascript")}
      criteria={{ limit: 25 }}
    >
      <div
        style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem", marginTop: "2rem" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "250px" }}>
          <RefinerPanel />
        </div>
        <div>
          <ResultsView />
        </div>
      </div>
    </DemoSetup>
  );
};

function ItemResult({ item }) {
  return (
    <div className="card">
      <div className="card-image">
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          <img
            className="img-responsive"
            src={
              item.image || "https://thepracticaldev.s3.amazonaws.com/i/6hqmcjaxbgbon8ydw93z.png"
            }
            alt="Cover Image"
          />
        </a>
      </div>
      <div className="card-header">
        <div className="card-title h5">{item.title}</div>
      </div>
      <div className="card-body">{item.description}</div>
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
    <div style={{ position: "relative" }}>
      <ClearRefinersButton style={{ position: "absolute", right: "0", top: ".5rem" }}>
        CLEAR
      </ClearRefinersButton>
      <div className="menu mb-2">
        <Textbox indexKey="title" label="Title" debounce={300} />
      </div>
      <div className="menu my-2">
        <MultiValueCheckboxes
          indexKey="tag_list"
          label="Tags"
          options={{ debounce: 0, maxRefinersOptions: 6, sort: "count" }}
        />
      </div>
      <div className="menu my-2">
        <Textbox indexKey="author" label="Author" debounce={300} />
      </div>
      <div className="menu my-2">
        <DateRangeRefiner indexKey="published_timestamp" label="Published" />
        <MultiValueCheckboxes
          indexKey="published_date"
          label=""
          options={{ debounce: 0, maxRefinersOptions: 6, sort: "count" }}
        />
      </div>

      <div className="menu my-2">
        <NumberRangeRefiner indexKey="reactions_count" label="Reactions" debounce={200} />
      </div>
    </div>
  );
}
