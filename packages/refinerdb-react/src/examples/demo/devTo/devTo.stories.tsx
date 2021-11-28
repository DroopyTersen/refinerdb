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
        <div className="card-title d-flex" style={{ justifyContent: "space-between", gap: "1rem" }}>
          <h5>{item.title}</h5>
        </div>
        <div
          className="mt-2 d-flex"
          style={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <div className="chip">
              <img src={item?.user?.profile_image_90} className="avatar avatar-sm" />
              {item?.user?.name}
            </div>
            <div className="mt-1 text-muted text-small">{item.published_date}</div>
          </div>
          <div className="center text-muted">
            <span className="badge" data-badge={item.reactions_count}>
              <i style={{ fontSize: "1.4rem" }} className="icon icon-emoji"></i>
            </span>
          </div>
        </div>
      </div>
      <div className="card-body text-small">{item.description}</div>
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
      <div className="mb-2 menu">
        <Textbox indexKey="title" label="Title" debounce={300} />
      </div>
      <div className="my-2 menu">
        <MultiValueCheckboxes
          indexKey="tag_list"
          label="Tags"
          options={{ debounce: 0, maxRefinersOptions: 6, sort: "count" }}
        />
      </div>
      <div className="my-2 menu">
        <Textbox indexKey="author" label="Author" debounce={300} />
      </div>
      <div className="my-2 menu">
        <DateRangeRefiner indexKey="published_timestamp" label="Published" />
        <MultiValueCheckboxes
          indexKey="published_date"
          label=""
          options={{ debounce: 0, maxRefinersOptions: 6, sort: "count" }}
        />
      </div>

      <div className="my-2 menu">
        <NumberRangeRefiner indexKey="reactions_count" label="Reactions" debounce={200} />
      </div>
    </div>
  );
}
