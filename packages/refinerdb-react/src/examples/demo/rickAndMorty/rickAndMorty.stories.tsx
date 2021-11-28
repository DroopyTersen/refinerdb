import { ComponentMeta } from "@storybook/react";
import React from "react";
import { RefinerDBProvider, useMultiSelectSetters, useQueryResult } from "../../..";
import { ClearRefinersButton, Textbox } from "../../refinerControls";
import MultiValueCheckboxes from "../../refinerControls/MultiValueCheckboxes";
import { DemoSetup } from "../DemoSetup";
import { getRickAndMortyData, rickAndMortyIndexes } from "./rickAndMorty.data";

export default {
  title: "Full Demos/Rick & Morty",
  component: RefinerDBProvider,
} as ComponentMeta<typeof RefinerDBProvider>;

export const Characters = () => {
  return (
    <DemoSetup
      dbName="rickandmorty-characters"
      indexes={rickAndMortyIndexes}
      getItems={getRickAndMortyData}
      criteria={{ limit: 25 }}
    >
      <div style={{ position: "relative" }}>
        <div className="d-flex" style={{ justifyContent: "space-between" }}>
          <h1 className="my-2">Rick & Morty Characters</h1>
        </div>
        <div className="layout">
          <div className="refiner-panel">
            <RefinerPanel />
          </div>
          <div className="results-view">
            <ResultsView />
          </div>
        </div>
      </div>
    </DemoSetup>
  );
};

const ItemResult = React.memo(function ItemResult({ item }: any) {
  let speciesRefiner = useMultiSelectSetters("species");
  let originRefiner = useMultiSelectSetters("origin");
  return (
    <div className="card">
      <img
        className="img-responsive"
        src={item.image || "https://thepracticaldev.s3.amazonaws.com/i/6hqmcjaxbgbon8ydw93z.png"}
        alt="Cover Image"
      />
      {/* <a href={item.url} target="_blank" rel="noopener noreferrer">
        </a> */}
      <footer>
        <h4>{item.name}</h4>
        <div>
          <button
            type="button"
            className="label success"
            onClick={() => speciesRefiner.appendValue(item?.species)}
          >
            {item?.species}
          </button>
        </div>
        <div>
          {item?.type && <div>Type: {item.type}</div>}
          <div>
            Origin:{" "}
            <a
              href="#"
              role="button"
              onClick={(e) => {
                e.preventDefault();
                originRefiner.appendValue(item?.origin?.name);
              }}
            >
              {item.origin?.name}
            </a>
          </div>
          <div>Status: {item.status}</div>
          <div>Last seen: {item?.location?.name || "??"}</div>
        </div>
      </footer>
    </div>
  );
});

function ResultsView() {
  let results = useQueryResult();
  if (!results) return <div>Loading...</div>;
  return (
    <>
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr)",
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
      <Textbox indexKey="name" label="Name" debounce={300} />
      <MultiValueCheckboxes
        indexKey="species"
        label="Species"
        options={{ debounce: 0, maxRefinersOptions: 8, sort: "count" }}
      />

      <MultiValueCheckboxes
        indexKey="origin"
        label="Origin"
        options={{ debounce: 0, maxRefinersOptions: 6, sort: "count" }}
      />

      <MultiValueCheckboxes
        indexKey="gender"
        label="Gender"
        options={{ debounce: 0, maxRefinersOptions: 6, sort: "alpha" }}
      />

      <MultiValueCheckboxes
        indexKey="status"
        label="Status"
        options={{ debounce: 0, maxRefinersOptions: 6, sort: "alpha" }}
      />
    </>
  );
}
