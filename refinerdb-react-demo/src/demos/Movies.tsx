import React, { useEffect, useState } from "react";
import { IndexType, MinMaxFilterValue } from "refinerdb";

import omit from "lodash/omit";
import Demo, { DemoProps } from "./Demo";
import { SingleValueDropdown, NumberRangeRefiner, Textbox } from "refinerdb-react";

let demo: DemoProps = {
  dbName: "movies",
  title: "Movies & TV",
  getItems: async () => {
    let [movies, tvShows] = await Promise.all([
      fetch("/movies.json").then((data) => data.json()),
      fetch("/tvShows.json").then((data) => data.json()),
    ]);

    movies = movies.map((item) => {
      item.released = new Date(item.released + " GMT-5000");
      item.type = "Movie";
      return item;
    });
    tvShows = tvShows.map((item) => {
      item.released = new Date(item.released + " GMT-5000");
      item.type = "TV Show";
      return item;
    });
    let allItems = [...movies, ...tvShows].map((item) => omit(item, "id"));
    console.log("TCL: allItems", allItems);
    return allItems;
  },
  indexes: [
    { key: "title", type: IndexType.String, skipRefinerOptions: true },
    { key: "type", type: IndexType.String },
    { key: "genre", path: "genres", type: IndexType.String },
    { key: "score", type: IndexType.Number, skipRefinerOptions: true },
    { key: "released", type: IndexType.Date, skipRefinerOptions: true },
  ],
  renderItem: function(item) {
    return (
      <article className="card">
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <img
            src={item.poster}
            style={{ flex: "0 0 100px", width: "100px", marginRight: "10px" }}
          />
          <div>
            <h3>{item.title}</h3>
            <div>{(item.genres || []).join(", ")}</div>
            <p>{item.overview}</p>
          </div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>Score: {item.score}</div>
            <div>{item?.released?.toDateString()}</div>
          </div>
        </div>
      </article>
    );
  },
  renderRefiners: function() {
    return (
      <>
        <Textbox indexKey="title" label="Title" debounce={300} />
        <SingleValueDropdown indexKey="type" label="Type" />
        <SingleValueDropdown indexKey="genre" label="Genre" />
        <NumberRangeRefiner indexKey="score" label="Score" debounce={200} />
      </>
    );
  },
};

const BabyNames: React.FC = () => {
  return <Demo {...demo}></Demo>;
};

export default BabyNames;
