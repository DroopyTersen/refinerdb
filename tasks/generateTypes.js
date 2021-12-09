const { Documentalist, TypescriptPlugin } = require("@documentalist/compiler");
const { writeFileSync, readFileSync } = require("fs");
const pathUtils = require("path");

const CORE_FILENAME = "core.types.json";
const REACT_FILENAME = "react.types.json";
const WEBSITE_PATH = pathUtils.join(__dirname, "../web/public/generated/");

new Documentalist()
  .use(
    /\.tsx?$/,
    new TypescriptPlugin({
      excludeNames: [/I.+State$/],
      tsconfigPath: "packages/refinerdb-react/tsconfig.json",
    })
  )
  .documentGlobs("packages/refinerdb-react/src/index.ts")
  .then((docs) => JSON.stringify(docs, null, 2))
  .then((json) =>
    writeFileSync(pathUtils.join(WEBSITE_PATH, REACT_FILENAME), json)
  );

new Documentalist()
  .use(/\.tsx?$/, new TypescriptPlugin({ excludeNames: [/I.+State$/] }))
  .documentGlobs("packages/refinerdb/index.ts")
  .then((docs) => JSON.stringify(docs, null, 2))
  .then((json) =>
    writeFileSync(pathUtils.join(WEBSITE_PATH, CORE_FILENAME), json)
  );
