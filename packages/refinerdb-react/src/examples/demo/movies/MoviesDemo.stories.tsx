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
import setupLocalStorageWorker from "refinerdb/lib/refinerdb.localStorage.worker";
console.log(
  "🚀 | setupLocalStorageWorker",
  setupLocalStorageWorker?.setupLocalStorageWorker?.toString()
);

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
    <div style={{ position: "relative" }}>
      <h2 style={{ margin: "0" }}>Refiners</h2>
      <ClearRefinersButton style={{ position: "absolute", right: "0", top: ".5rem" }}>
        CLEAR
      </ClearRefinersButton>
      <div>
        <Textbox indexKey="title" label="Title" debounce={300} />
      </div>
      <div>
        <MultiValueCheckboxes indexKey="type" label="Type" />
      </div>
      <div>
        <MultiValueSelect indexKey="genre" label="Genres" />
      </div>
      <div>
        <DateRangeRefiner indexKey="released" label="Release Date" />
      </div>
      <div>
        <NumberRangeRefiner indexKey="score" label="Score" debounce={200} />
      </div>
    </div>
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
    <div className="card" style={{ marginBottom: "1rem" }}>
      <div className="card-header">
        <h4 className="card-title">{item.title}</h4>
      </div>
      <div className="card-body">
        {item.genres.map((genre) => (
          <button
            type="button"
            className="chip c-hand text-primary"
            style={{ border: "none", outline: "none" }}
            onClick={() => genreRefiner.appendValue(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
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
      <div
        style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem", marginTop: "2rem" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "250px" }}>
          <RefinerPanel />
        </div>
        <div>
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
      <div
        style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem", marginTop: "2rem" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "250px" }}>
          <RefinerPanel />
        </div>
        <div>
          <ResultsViewSkipHydrateItems />
        </div>
      </div>
    </DemoSetup>
  );
};

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
