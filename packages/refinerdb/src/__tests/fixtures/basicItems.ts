import { IndexConfig, IndexType } from "../..";

const basicItems = {
  items: [
    { title: "three", id: 3, color: "orange" },
    { title: "two", id: 2, color: "blue" },
    { title: "one", id: 1, color: "red" },
    { title: "four", id: 4, color: "purple" },
  ],
  indexDefinitions: [
    { key: "title", type: IndexType.String },
    { key: "id", type: IndexType.Number },
    { key: "color", type: IndexType.String },
  ] as IndexConfig[],
};

export const cloneBasicItems = () => {
  let items = JSON.parse(JSON.stringify(basicItems.items));
  let indexDefinitions = JSON.parse(JSON.stringify(basicItems.indexDefinitions));
  return { items, indexDefinitions };
};
