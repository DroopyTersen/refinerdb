import React, { useEffect, useState } from "react";
import { IndexType, MinMaxFilterValue } from "refinerdb";

import Demo, { DemoProps } from "./Demo";
import { Textbox, SingleValueDropdown, NumberRangeRefiner } from "refinerdb-react";

let demo: DemoProps = {
  dbName: "babynames",
  title: "Baby Names",
  getItems: () => {
    return fetch("/babyNames.json").then((data) => data.json());
  },
  indexes: [
    { key: "birthYear", type: IndexType.Number, skipRefinerOptions: true },
    { key: "ethnicity", type: IndexType.String },
    { key: "gender", type: IndexType.String },
    { key: "firstName", type: IndexType.String, skipRefinerOptions: true },
    { key: "rank", type: IndexType.Number, skipRefinerOptions: true },
  ],
  renderItem: function(item) {
    return (
      <article className="card">
        <header>
          <h2>{item.firstName}</h2>
        </header>
        <footer>
          <div>Rank: {item.rank}</div>
          <div>Year: {item.birthYear}</div>
          <div>Ethnicity: {item.ethnicity}</div>
        </footer>
      </article>
    );
  },
  renderRefiners: function() {
    return (
      <>
        <Textbox indexKey="firstName" label="Name" />
        <SingleValueDropdown indexKey="ethnicity" />
        <SingleValueDropdown indexKey="gender" />
        <NumberRangeRefiner indexKey="birthYear" label="Birth Year" delay={200} />
        <NumberRangeRefiner indexKey="rank" label="Rank" />
      </>
    );
  },
};

const BabyNames: React.FC = () => {
  return <Demo {...demo}></Demo>;
};

export default BabyNames;
