import { IndexConfig, IndexType } from "refinerdb-react";
export const indexes: IndexConfig[] = [
  // An index where the key doesn't match the property name on the item
  { key: "genre", type: IndexType.String, path: "genres" },
  // For properties that generally have unique values, improve
  // performance by specifying 'skipRefinerOptions'
  { key: "title", type: IndexType.String, skipRefinerOptions: true },
  // // A number index
  { key: "score", type: IndexType.Number, skipRefinerOptions: true },
  // A custom year index that derives it value from the released date string
  {
    key: "year",
    type: IndexType.String,
    map: (item) => new Date(item.released)?.getFullYear() + "",
  },
];
