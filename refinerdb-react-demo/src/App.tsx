import React, { useEffect, useState } from "react";
import "./App.css";
import BabyNames from "./demos/BabyNames";
import Movies from "./demos/Movies";
import usePersistedState from "hooks/usePersistedState";
let demos = {
  babynames: BabyNames,
  movies: Movies,
};
const App: React.FC = () => {
  let [demoKey, setDemoKey] = usePersistedState("movies", "refinerdb-demo-key");
  let Demo = demos[demoKey] || DemoNotFound;
  return (
    <>
      <nav>
        <h4 className="title">RefinerDB</h4>
        <div>
          <a className="button button-clear" href="#" onClick={() => setDemoKey("movies")}>
            Movies & TV
          </a>
          <a className="button button-clear" href="#" onClick={() => setDemoKey("babynames")}>
            Baby Names
          </a>
        </div>
      </nav>
      <Demo />
    </>
  );
};

function DemoNotFound() {
  return <h1>Unable to find demo</h1>;
}

export default App;
