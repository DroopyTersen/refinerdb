const fs = require("fs/promises");
const path = require("path");

let DEMOS_PATH = path.join(__dirname, "..", "app/features/sandpack/demos");
let OUTPUT_PATH = path.join(__dirname, "..", "public/generated");
let demoJSON = {};
let CONFIG_FILENAME = "sandpack.json";

let bundleDemo = async (slug) => {
  try {
    let demoFolder = path.join(DEMOS_PATH, slug);
    console.log(demoFolder);
    let fileNames = await fs.readdir(demoFolder);
    console.log(fileNames);

    let sandpackConfig = await fs
      .readFile(path.join(demoFolder, CONFIG_FILENAME), "utf-8")
      .then(JSON.parse);

    for (let i = 0; i < fileNames.length; i++) {
      let filename = fileNames[i];
      if (filename !== CONFIG_FILENAME) {
        let fileContents = await fs.readFile(path.join(demoFolder, filename), "utf8");
        if (filename !== "index.html") {
          filename = "/src/" + filename;
        }
        if (!sandpackConfig.files[filename]) {
          sandpackConfig.files[filename] = {};
        }
        sandpackConfig.files[filename].code = fileContents;
      }
    }
    demoJSON[slug] = sandpackConfig;
  } catch (err) {
    console.error("Unable to parse", slug);
    console.log(err);
  }
};
let bundleCodeDemos = async () => {
  try {
    await fs.rm(path.join(DEMOS_PATH, "demos.json"));
  } catch (err) {}
  let demoFolders = await fs.readdir(DEMOS_PATH);
  for (let i = 0; i < demoFolders.length; i++) {
    await bundleDemo(demoFolders[i]);
  }
  await fs.writeFile(
    path.join(OUTPUT_PATH, "demos.json"),
    JSON.stringify(demoJSON, null, 2)
  );
};

bundleCodeDemos();
