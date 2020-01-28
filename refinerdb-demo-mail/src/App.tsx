import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import { Providers, MsalProvider, prepScopes } from "@microsoft/mgt";
import "@microsoft/mgt/dist/es6/components/mgt-login/mgt-login.js";
import createMailStream from "data/mailStreamer";
import MailDemo from "demos/MailDemo";
Providers.globalProvider = new MsalProvider({ clientId: "cc4da238-8402-4759-8622-c730b912d313" });
const App: React.FC = () => {
  // useEffect(() => {
  //   let stream = createMailStream((items) => console.log("Mail Results", items));
  //   stream.start();

  //   return () => stream.cancel();
  // }, []);
  return (
    <>
      <nav>
        <h4 className="title">Mail Finder: RefinerDB</h4>
      </nav>
      <Login />
      <MailDemo />
    </>
  );
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "mgt-login": any;
    }
  }
}

let Login = function() {
  let ref = useRef(null);
  useEffect(() => {
    let handler = (e) => {
      console.log("LOGIN COMPLETED", e);
    };
    if (ref.current) {
      ref.current.addEventListener("loginCompleted", handler);
    }
    return () => {
      if (ref.current) {
        ref.current.removeEventListener("loginCompleted", handler);
      }
    };
  }, [ref.current]);

  return <mgt-login ref={ref} />;
};

export default App;
