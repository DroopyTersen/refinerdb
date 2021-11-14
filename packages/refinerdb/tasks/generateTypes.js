const { Documentalist, TypescriptPlugin } = require("@documentalist/compiler");
const { writeFileSync, readFileSync } = require("fs");

const FILEPATH = "public/generatedTypes.json";
new Documentalist()
  .use(/\.tsx?$/, new TypescriptPlugin({ excludeNames: [/I.+State$/] }))
  .documentGlobs("src/RefinerDB.ts")
  .then((docs) => JSON.stringify(docs, null, 2))
  .then((json) => writeFileSync(FILEPATH, json))
  .then(() => {
    let contents = readFileSync(FILEPATH, { encoding: "utf-8" });
    // contents = "export default " + contents;
    writeFileSync(FILEPATH, contents);
  });
