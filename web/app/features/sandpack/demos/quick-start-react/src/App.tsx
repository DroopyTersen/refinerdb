import { RefinerDBProvider } from "refinerdb-react";
import {
  GenreRefiner,
  ScoreRefiner,
  TitleRefiner,
  YearRefiner,
} from "./components/refiners";
import { ResultsView } from "./components/ResultsView";
import { indexes } from "./indexes";
import { useData } from "./useData";

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
