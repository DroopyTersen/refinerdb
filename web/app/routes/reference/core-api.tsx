import { LoaderFunction } from "@remix-run/server-runtime";
import { useLoaderData } from "remix";
import { DocumentClass } from "~/features/apiReference/components/DocumentClass";
import { DocumentEnum } from "~/features/apiReference/components/DocumentEnum";
import { RightColumnLayout } from "~/features/layouts/RightColumnLayout";

export const loader: LoaderFunction = async (context) => {
  let urlParts = new URL(context?.request.url || "");
  let generatedTypes = await fetch(
    urlParts.origin + "/generated/generatedTypes.json"
  ).then((res) => res.json());

  return generatedTypes?.typescript;
};

export default function CoreApiPage() {
  let generatedTypes = useLoaderData();
  console.log(generatedTypes?.RefinerDB);
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
      <DocumentClass classDef={generatedTypes?.RefinerDBConfig} className="my-24" />
      <DocumentClass classDef={generatedTypes?.IndexConfig} className="my-24" />
      <DocumentEnum enumDef={generatedTypes?.IndexType} className="my-24" />
      <DocumentClass classDef={generatedTypes?.QueryCriteria} className="my-24" />
      <DocumentClass classDef={generatedTypes?.QueryResult} className="my-24" />
      <DocumentClass classDef={generatedTypes?.RefinerOption} className="my-24" />
    </RightColumnLayout>
  );
}
