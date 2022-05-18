import { useLoaderData } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/server-runtime";
import { DocumentClass } from "~/features/apiReference/components/DocumentClass";
import { DocumentEnum } from "~/features/apiReference/components/DocumentEnum";
import { RightColumnLayout } from "~/features/layouts/RightColumnLayout";

let GITHUB_PREFIX =
  "https://raw.githubusercontent.com/DroopyTersen/refinerdb/dev/web/public";

export const loader: LoaderFunction = async (context) => {
  let urlParts = new URL(context?.request.url || "");
  let prefix = urlParts.origin.toLowerCase().includes("refinerdb")
    ? GITHUB_PREFIX
    : urlParts.origin;

  let url = prefix + "/generated/generatedTypes.json";
  console.log("🚀 | constloader:LoaderFunction= | url", url);
  let generatedTypes = await fetch(url).then((res) => res.json());
  return generatedTypes?.typescript;
};

export const headers = () => {
  return {
    "Cache-Control": "max-age=300, s-maxage=3600",
  };
};

export default function CoreApiPage() {
  let generatedTypes = useLoaderData();
  return (
    <RightColumnLayout
      sidebarLinks={[
        { title: "RefinerDB", to: "#refinerdb" },
        { title: "RefinerDBConfig", to: "#refinerdbconfig" },
        { title: "IndexConfig", to: "#indexconfig" },
        { title: "IndexType", to: "#indextype" },
        { title: "QueryCriteria", to: "#querycriteria" },
        { title: "QueryResult", to: "#queryresult" },
        { title: "RefinerOption", to: "#refineroption" },
      ]}
    >
      <h1>Core API</h1>

      <p>This documentation for RefinerDB core, not the React package.</p>

      <DocumentClass classDef={generatedTypes?.RefinerDB} className="my-24" />
      <DocumentClass
        classDef={generatedTypes?.RefinerDBConfig}
        className="my-24"
      />
      <DocumentClass classDef={generatedTypes?.IndexConfig} className="my-24" />
      <DocumentEnum enumDef={generatedTypes?.IndexType} className="my-24" />
      <DocumentClass
        classDef={generatedTypes?.QueryCriteria}
        className="my-24"
      />
      <DocumentClass classDef={generatedTypes?.QueryResult} className="my-24" />
      <DocumentClass
        classDef={generatedTypes?.RefinerOption}
        className="my-24"
      />
    </RightColumnLayout>
  );
}
