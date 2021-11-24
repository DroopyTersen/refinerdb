import { RefinerDB, IndexType } from "refinerdb";
import items from "./items";

let indexDefinitions = [
  { key: "tags", type: IndexType.String },
  // Because all of the titles are generally unique, generating a list of
  // refiner options and their counts is not that useful. We can improve
  // performance by skipping that step.
  { key: "title", type: IndexType.String, skipRefinerOptions: true },
];

export const setupRefinerDB = () => {
  let refinerDB = new RefinerDB("my-demo");
  refinerDB.setIndexes(indexDefinitions);
  refinerDB.setItems(items);

  return refinerDB;
};
