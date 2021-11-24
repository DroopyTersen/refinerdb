import { LoaderFunction } from "@remix-run/server-runtime";

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

export const loader: LoaderFunction = async (context) => {
  let slug = context?.params?.slug || "";
  let urlParts = new URL(context?.request.url || "");
  let demos = await fetch(urlParts.origin + "/generated/demos.json").then((res) =>
    res.json()
  );
  // console.log("🚀 | constloader:LoaderFunction= | demos", demos);
  let demo = demos[slug];
  return { slug, url: context.request.url, demo };
};
