import { setupRefinerDB } from "./setup";

const rootElement = document.getElementById("app");
const refinerDB = setupRefinerDB();

let init = async () => {
  let { items, refiners } = await refinerDB.query({
    filter: {
      tags: "fun",
    },
  });

  if (rootElement) {
    rootElement.innerHTML = `
    <h1>Query Result</h1>
    <pre>${JSON.stringify({ items, refiners }, null, 2)}</pre>`;
  }
};
init();
