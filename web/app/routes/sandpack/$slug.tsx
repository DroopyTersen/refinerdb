import { LoaderFunction } from "@remix-run/server-runtime";
import demos from "../../features/sandpack/demos/demos.json";

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
  let demo = demos[slug];
  return { slug, demo };
};
