import { RefinerDBProvider } from "refinerdb-react";
import {
  GenreRefiner,
  ScoreRefiner,
  TitleRefiner,
  YearRefiner,
} from "./src/components/refiners";
import { ResultsView } from "./src/components/ResultsView";
import { indexes } from "./src/indexes";
import { useData } from "./src/useData";

export default function App() {
  let movies = useData();

  return (
    <RefinerDBProvider name="movie-demo" indexes={indexes} items={movies}>
      <div className="layout">
        <div className="refiner-panel">
          <TitleRefiner />
          <ScoreRefiner />
          <YearRefiner />
          <GenreRefiner />
        </div>

        <div className="results-panel">
          <ResultsView />
        </div>
      </div>
    </RefinerDBProvider>
  );
}
