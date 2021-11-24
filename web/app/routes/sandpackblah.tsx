import { Sandpack } from "@codesandbox/sandpack-react";
import { useEffect, useState } from "react";
import { LinksFunction, useLoaderData, LoaderFunction } from "remix";

export interface SandpackFile {
  code: string;
  hidden?: boolean;
  active?: boolean;
}

export interface SandpackSetup {
  files: Record<string, SandpackFile>;
  dependencies?: Record<string, string>;
  entry: string;
}

export let links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: "https://unpkg.com/@codesandbox/sandpack-react/dist/index.css",
    },
  ];
};

export const loader: LoaderFunction = () => {
  let sandpackSetup: SandpackSetup = {
    files,
    entry: "index.html",
    dependencies: {
      refinerdb: "next",
    },
  };

  return sandpackSetup;
};
export default function SandpackPage() {
  let setup = useLoaderData<SandpackSetup>();
  let [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, 500);
  }, []);
  return (
    <div>
      <h1>Sandpack</h1>
      {show && (
        <div>
          <Sandpack
            template="vanilla-ts"
            files={setup.files}
            customSetup={{
              dependencies: setup.dependencies,
              entry: setup.entry,
            }}
            options={{
              editorHeight: 700,
              showNavigator: false, // this will show a top navigator bar instead of the refresh button
              showLineNumbers: true, // this is off by default, but you can show line numbers for the editor
              editorWidthPercentage: 60, // by default the split is 50/50 between the editor and the preview
            }}
          />
        </div>
      )}
    </div>
  );
}

let entryCode = `import { setupRefinerDB } from "./setup";

const rootElement = document.getElementById("app");
const refinerDB = setupRefinerDB();

let init = async () => {
  let { items, refiners } = await refinerDB.query({ 
    filter: { 
      tags: "fun" 
    }
  });

  rootElement.innerHTML = \`
  <h1>Query Result</h1>
  <pre>\${JSON.stringify({items, refiners}, null, 2)}</pre>\`

  // rootElement.innerHTML = "<h1>Hey</h1>";
}
init();
`;

let itemsCode = `export default [
  { title: "Watch the new Matrix", id: 1, tags: ["fun"] },
  { title: "Cut the grass", id: 2, tags: ["chore", "lawn"] },
  { title: "Buy fetilizer", id: 4, tags: ["lawn", "shopping"] },
  { title: "Build RefinerDB", id: 3, tags: ["fun", "code"] },
  { title: "Document RefinerDB", id: 11, tags: ["chore", "code"] },
];`;

let setupRefinerDBCode = `import { RefinerDB, IndexType } from "refinerdb";
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
}

`;

const indexHtml = `<!DOCTYPE html>
<html>

<head>
  <title>Parcel Sandbox</title>
  <meta charset="UTF-8" />
</head>

<body>
  <div id="app"></div>

  <script src="src/index.ts">
  </script>
</body>

</html>`;

const files = {
  "index.html": {
    code: indexHtml,
    hidden: true,
  },
  "/src/index.ts": {
    code: entryCode,
  },
  "/src/setup.ts": {
    code: setupRefinerDBCode,
    active: true,
  },
  "/src/items.ts": {
    code: itemsCode,
  },
};
