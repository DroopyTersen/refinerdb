import { ComponentMeta } from "@storybook/react";
import React from "react";
import { RefinerDBProvider, useMultiSelectSetters, useQueryResult } from "../../..";
import { ClearRefinersButton, NumberRangeRefiner, Textbox } from "../../refinerControls";
import DateRangeRefiner from "../../refinerControls/DateRangeRefiner";
import MultiValueCheckboxes from "../../refinerControls/MultiValueCheckboxes";
import MultiValueSelect from "../../refinerControls/MultiValueSelect";
import { DemoSetup } from "../DemoSetup";
import movies from "./fixtures/movies";
import tvShows from "./fixtures/tvShows";
import { getMoviesAndTv } from "./movies.data";
import { movieIndexes } from "./movies.indexes";

// let localStorageWorker = new Worker(
//   URL.createObjectURL(
//     new Blob(["(" + (window as any).__rdb_setupLocalStorageWorker.toString() + ")()"], {
//       type: "text/javascript",
//     })
//   )
// );

// console.log((window as any).__rdb_setupLocalStorageWorker.toString());
export default {
  title: "Full Demos/Movies & TV",
  component: RefinerDBProvider,
} as ComponentMeta<typeof RefinerDBProvider>;

function RefinerPanel() {
  return (
    <>
      <h2 style={{ margin: "0" }}>Refiners</h2>
      <ClearRefinersButton style={{ position: "absolute", right: "0", top: ".5rem" }}>
        CLEAR
      </ClearRefinersButton>
      <Textbox indexKey="title" label="Title" debounce={300} />
      <MultiValueCheckboxes indexKey="type" label="Type" />
      <MultiValueSelect indexKey="genre" label="Genres" />
      <MultiValueCheckboxes indexKey="year" label="Year" options={{ sort: "count" }} />
      <DateRangeRefiner indexKey="released" label="Release Date" />
      <NumberRangeRefiner indexKey="score" label="Score" debounce={200} />
    </>
  );
}

function ResultsViewWithHydratedItems() {
  let results = useQueryResult();
  if (!results) return <div>Loading...</div>;
  return (
    <>
      <h2 style={{ margin: "0" }}>Results ({results?.totalCount})</h2>
      <ItemsList items={results?.items} />
      {results.totalCount > 25 && <div>...</div>}
    </>
  );
}
const MovieResultItem = React.memo(function MovieResultItem({ item }: { item: any }) {
  let genreRefiner = useMultiSelectSetters("genre");
  return (
    <article key={item.id} className="card">
      <footer>
        <h4>{item.title}</h4>
        <div>
          <span>Score: {item.score}</span>
          {item.genres.map((genre) => (
            <button key={genre} className="label" onClick={() => genreRefiner.appendValue(genre)}>
              {genre}
            </button>
          ))}
        </div>
      </footer>
    </article>
  );
});

function ResultsViewSkipHydrateItems() {
  let results = useQueryResult({ hydrateItems: false });
  if (!results) return <div>Loading...</div>;
  let items = results?.itemIds
    .slice(0, 25)
    .map((id) => movies.find((m) => m.id === id) || tvShows.find((t) => t.id === id))
    .filter(Boolean);
  return (
    <>
      <h2 style={{ margin: "0" }}>Results ({results?.totalCount})</h2>
      <ItemsList items={items} />
      {results.totalCount > 25 && <div>...</div>}
    </>
  );
}

function ItemsList({ items }) {
  if (!items) return null;
  return (
    <div>
      {items
        ?.slice(0, 25)
        ?.filter((item) => item.id)
        ?.map((item) => (
          <MovieResultItem key={item.id} item={item} />
        ))}
    </div>
  );
}
export const Basic = () => {
  return (
    <DemoSetup dbName="movies-and-tv" indexes={movieIndexes} getItems={getMoviesAndTv}>
      <div className="layout">
        <div className="refiner-panel">
          <RefinerPanel />
        </div>
        <div className="results-view">
          <ResultsViewWithHydratedItems />
        </div>
      </div>
    </DemoSetup>
  );
};

export const SkipHydrateItems = () => {
  return (
    <DemoSetup
      dbName="movies-and-tv"
      indexes={movieIndexes}
      getItems={getMoviesAndTv}
      hydrateItems={false}
    >
      <div className="layout">
        <div className="refiner-panel">
          <RefinerPanel />
        </div>
        <div className="results-view">
          <ResultsViewSkipHydrateItems />
        </div>
      </div>
    </DemoSetup>
  );
};

// let linkTag = document.createElement("link");
// linkTag.rel = "stylesheet";
// linkTag.href = "https://cdn.jsdelivr.net/npm/picnic";
// document.body.appendChild(linkTag);

// export const WebWorker = () => {
//   let storeRef = React.useRef(
//     createLocalStorageStore("movies-and-tv", { worker: localStorageWorker })
//   );
//   return (
//     <DemoSetup
//       dbName="movies-and-tv"
//       indexes={movieIndexes}
//       getItems={getMoviesAndTv}
//       store={storeRef.current}
//     >
//       <div
//         style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem", marginTop: "2rem" }}
//       >
//         <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "250px" }}>
//           <RefinerPanel />
//         </div>
//         <div>
//           <ResultsViewSkipHydrateItems />
//         </div>
//       </div>
//     </DemoSetup>
//   );
// };
