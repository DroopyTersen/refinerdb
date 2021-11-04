import { IndexConfig, IndexType } from "refinerdb";

export const movieIndexes: IndexConfig[] = [
  { key: "title", label: "Title", type: IndexType.String, skipRefinerOptions: true },
  { key: "type", type: IndexType.String },
  { key: "genre", label: "Genre", path: "genres", type: IndexType.String },
  { key: "score", label: "Score", type: IndexType.Number, skipRefinerOptions: true },
  { key: "released", label: "Released", type: IndexType.Date, skipRefinerOptions: true },
];
