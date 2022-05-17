import { LoaderFunction } from "@remix-run/server-runtime";
// import demos from "../../../public/generated/demos.json";

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

let GITHUB_PREFIX =
  "https://raw.githubusercontent.com/DroopyTersen/refinerdb/dev/web/public";

// this code doesn't work in cloudflare
// {
// "slug": "quick-start-react",
// "error": {
// "name": "TypeError",
// "message": "Too many redirects.; urlList = https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json, https://refinerdb.com/generated/demos.json"
// },
// "req": {
// "url": "https://refinerdb.com/demos/quick-start-react",
// "host": "refinerdb.com"
// }
// }
export const loader: LoaderFunction = async (context) => {
  let slug = context?.params?.slug || "";
  let publicPath = "/generated/demos.json";
  let urlParts = new URL(context?.request.url || "");
  let prefix = urlParts.origin.toLowerCase().includes("refinerdb")
    ? GITHUB_PREFIX
    : urlParts.origin;

  let url = prefix + publicPath;

  let error = null;
  // let url = new URL(context.request.url);
  let demos = await fetch(url)
    .then((res) => res.json())
    .catch((err: Error) => {
      console.error(err);
      error = {
        ...err,
        name: err?.name,
        message: err?.message,
      };
      return null;
    });

  let demo = demos?.[slug];

  return {
    slug,
    demo,
    url,
  };
};
