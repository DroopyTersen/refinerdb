import { ComponentMeta } from "@storybook/react";
import React from "react";
import {
  RefinerDBProvider,
  useMultiselectRefiner,
  useMultiSelectSetters,
  useQueryResult,
  useSort,
} from "../../..";
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "2rem",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "250px" }}>
            <RefinerPanel />
          </div>
          <div>
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
  console.log("rendering", item?.origin.name);
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
          <h5>{item.name}</h5>
        </div>
        <div>
          <button
            type="button"
            className="chip c-hand text-primary"
            style={{ border: "none", outline: "none" }}
            onClick={() => speciesRefiner.appendValue(item?.species)}
          >
            {item?.species}
          </button>
        </div>
      </div>
      <div className="card-body text-tiny">
        {item?.type && <div>Type: {item.type}</div>}
        <div>
          Origin:{" "}
          <a
            href="#"
            role="button"
            className="text-primary"
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
    <div>
      <ClearRefinersButton style={{ position: "absolute", right: "0", top: ".5rem" }}>
        CLEAR
      </ClearRefinersButton>
      <div className="menu mb-2">
        <Textbox indexKey="name" label="Name" debounce={300} />
      </div>
      <div className="menu my-2">
        <MultiValueCheckboxes
          indexKey="species"
          label="Species"
          options={{ debounce: 0, maxRefinersOptions: 8, sort: "count" }}
        />
      </div>

      <div className="menu my-2">
        <MultiValueCheckboxes
          indexKey="origin"
          label="Origin"
          options={{ debounce: 0, maxRefinersOptions: 6, sort: "count" }}
        />
      </div>

      <div className="menu my-2">
        <MultiValueCheckboxes
          indexKey="gender"
          label="Gender"
          options={{ debounce: 0, maxRefinersOptions: 6, sort: "alpha" }}
        />
      </div>

      <div className="menu my-2">
        <MultiValueCheckboxes
          indexKey="status"
          label="Status"
          options={{ debounce: 0, maxRefinersOptions: 6, sort: "alpha" }}
        />
      </div>
    </div>
  );
}
