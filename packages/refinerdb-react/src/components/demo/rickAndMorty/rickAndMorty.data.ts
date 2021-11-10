import { IndexConfig, IndexType } from "refinerdb";
import rickAndMortyCharacters from "./rickAndMorty.characters";

export const getRickAndMortyData = async () => {
  return Promise.resolve(rickAndMortyCharacters);
};

export const rickAndMortyIndexes: IndexConfig[] = [
  { key: "name", type: IndexType.String, skipRefinerOptions: true, label: "Name" },
  { key: "status", type: IndexType.String, skipRefinerOptions: false, label: "Status" },
  { key: "species", type: IndexType.String, skipRefinerOptions: false, label: "Species" },
  { key: "gender", type: IndexType.String, skipRefinerOptions: false, label: "Gender" },
  {
    key: "origin",
    type: IndexType.String,
    skipRefinerOptions: false,
    label: "Origin",
    path: "origin.name",
  },
];
