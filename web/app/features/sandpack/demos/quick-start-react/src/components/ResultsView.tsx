import { useQueryResult } from "refinerdb-react";

export function ResultsView() {
  let results = useQueryResult();
  if (!results) return <div>Loading...</div>;
  let itemToShow = (results?.items ?? []).slice(0, 20);
  return (
    <>
      <h2 style={{ margin: "0" }}>Results ({results?.totalCount})</h2>
      {itemToShow.map((item) => (
        <article key={item.id} className="card">
          <footer>
            <h4>{item.title}</h4>
            <div>
              <span>Score: {item.score}</span>
              {item.genres.map((genre) => (
                <span className="label">{genre}</span>
              ))}
            </div>
          </footer>
        </article>
      ))}
      {results.totalCount > 20 && <div>...</div>}
    </>
  );
}
