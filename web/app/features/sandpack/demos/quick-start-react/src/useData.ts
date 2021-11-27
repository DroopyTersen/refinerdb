import { useEffect, useState } from "react";

// JSON file containing 1000 popular movies
const ENDPOINT =
  "https://raw.githubusercontent.com/DroopyTersen/refinerdb/dev/packages/refinerdb/public/movies.json";

export function useData() {
  let [items, setItems] = useState([]);
  // This is NOT the proper way to do async data
  // in React, but trying to keep this example simple
  useEffect(() => {
    fetch(ENDPOINT)
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, []);

  return items;
}
