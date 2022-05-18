import { IndexConfig, IndexType } from "refinerdb";

export const movieIndexes: IndexConfig[] = [
  { key: "title", type: IndexType.String, skipRefinerOptions: true },
  { key: "type", type: IndexType.String },
  { key: "genre", path: "genres", type: IndexType.String },
  { key: "score", type: IndexType.Number, skipRefinerOptions: true },
  { key: "released", type: IndexType.Date, skipRefinerOptions: true },
  // {
  //   key: "year",
  //   type: IndexType.String,
  //   // map: (item) => item.released,
  // },
];
