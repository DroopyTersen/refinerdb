const fsExtra = require("fs-extra");
const path = require("path");

let DEMOS_PATH = path.join(__dirname, "..", "app/features/sandpack/demos");
let OUTPUT_PATH = path.join(__dirname, "..", "public/generated");
let demoJSON = {};
let CONFIG_FILENAME = "sandpack.json";

let parseFolder = (demoFolder, subFolder = "") => {
  let folderPath = path.join(demoFolder, subFolder);
  let files = [];
  fsExtra.readdirSync(folderPath).forEach((childName) => {
    if (childName === CONFIG_FILENAME) return;
    let child = fsExtra.statSync(path.join(folderPath, childName));
    if (child.isFile()) {
      let contents = fsExtra.readFileSync(
        path.join(folderPath, childName),
        "utf-8"
      );
      let file = {
        path: subFolder ? subFolder + "/" + childName : childName,
        contents,
      };
      files.push(file);
    } else if (child.isDirectory()) {
      files = [
        ...files,
        ...parseFolder(demoFolder, subFolder + "/" + childName),
      ];
    }
  });
  return files;
};

let bundleDemo = async (slug) => {
  let demoFolder = path.join(DEMOS_PATH, slug);
  console.log("🚀 | bundleDemo | demoFolder", demoFolder);
  let sandpackConfig = await fsExtra
    .readFile(path.join(demoFolder, CONFIG_FILENAME), "utf-8")
    .then(JSON.parse);

  let files = parseFolder(demoFolder);
  files.forEach((file) => {
    if (file?.path?.[0] !== "/") {
      file.path = "/" + file.path;
    }
    console.log("🚀 | files.forEach | file", file.path);
    if (!sandpackConfig.files[file.path]) {
      sandpackConfig.files[file.path] = {};
    }
    sandpackConfig.files[file.path].code = file.contents;
  });

  demoJSON[slug] = sandpackConfig;
};

let bundleCodeDemos = async () => {
  let demoFolders = await fsExtra.readdir(DEMOS_PATH);
  for (let i = 0; i < demoFolders.length; i++) {
    await bundleDemo(demoFolders[i]);
  }
  fsExtra.writeFileSync(
    path.join(OUTPUT_PATH, "demos.json"),
    JSON.stringify(demoJSON, null, 2)
  );
};

bundleCodeDemos();
