import React, { useEffect, useState } from "react";
import RefinerDB, { IndexType, MinMaxFilterValue } from "refinerdb";

import omit from "lodash/omit";
import Demo, { DemoProps } from "./Demo";
import { SingleValueDropdown, NumberRangeRefiner, Textbox } from "refinerdb-react";
import createMailStream from "data/mailStreamer";

let demo: DemoProps = {
  dbName: "mail",
  title: "Mail",
  getItems: async (db: RefinerDB) => {
    db.setItems([]);
    let stream = createMailStream((items) => {
      console.log("Setting items", items);
      db.pushItems(items);
    });
    stream.start();
  },
  indexes: [
    {
      key: "date",
      label: "Received",
      path: "date",
      type: IndexType.Date,
      skipRefinerOptions: true,
    },
    { key: "subject", label: "Subject", type: IndexType.String, skipRefinerOptions: true },
    { key: "from", label: "From", type: IndexType.String },
    { key: "toRecipients", label: "To", type: IndexType.String },
    { key: "ccRecipients", label: "CC", type: IndexType.String },
    { key: "body", label: "Body", type: IndexType.String, skipRefinerOptions: true },
  ],
  renderItem: function(item) {
    return (
      <article className="card">
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div>
            <a href={item.webLink} target="_blank">
              <h3>{item.subject}</h3>
            </a>
            <div>{item.date.toString()}</div>
            <div>From: {item.from}</div>
          </div>
        </div>
        <div>{item.bodyPreview}</div>
      </article>
    );
  },
  renderRefiners: function() {
    return (
      <>
        <Textbox indexKey="subject" label="Subject" debounce={300} />
        <Textbox indexKey="body" label="Body" debounce={300} />
        <Textbox indexKey="from" label="From" />
        <Textbox indexKey="to" label="To" />
        {/* <NumberRangeRefiner indexKey="cc" label="CC" debounce={200} /> */}
      </>
    );
  },
};

const MailDemo: React.FC = () => {
  return <Demo {...demo}></Demo>;
};

export default MailDemo;
