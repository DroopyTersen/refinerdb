import { IndexType, RefinerDB } from "refinerdb";

// JSON file containing 1000 popular movies
const MOVIES_ENDPOINT =
  "https://raw.githubusercontent.com/DroopyTersen/refinerdb/dev/packages/refinerdb/public/movies.json";

let init = async () => {
  // 1. Create an instance of RefinerDB
  let refinerDB = new RefinerDB("movies-db");

  // 2. Register the indexes
  refinerDB.setIndexes([
    // An index where the key doesn't match the property name on the item
    { key: "genre", type: IndexType.String, path: "genres" },
    // For properties that generally have unique values, improve
    // performance by specifying 'skipRefinerOptions'
    { key: "title", type: IndexType.String, skipRefinerOptions: true },
    // A Date index
    { key: "released", type: IndexType.Date, skipRefinerOptions: true },
    // // A number index
    { key: "score", type: IndexType.Number, skipRefinerOptions: true },
  ]);

  // 3. Fetch data then add it to the RefinerDB
  let movies = await fetch(MOVIES_ENDPOINT).then((res) => res.json());
  refinerDB.setItems(movies);

  // 4. Query Data
  // A 7+ rated 'Action' or 'Comedy' with 'day' in the title
  let filter = {
    title: "day*",
    genre: ["Action", "Comedy"],
    score: { min: 7 },
  };
  let { items, refiners, totalCount } = await refinerDB.query({
    filter,
    sort: "released",
  });

  // 5. Display the results
  renderData({
    totalCount,
    titles: items.map((item) => item.title),
    refiners,
  });
};

// Not a RefinerDB thing, just a quick util to show data in a pre tag
const renderData = (data) => {
  const rootElement = document.getElementById("app");
  if (rootElement) {
    rootElement.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  }
};

init();
