import { LoaderFunction } from "@remix-run/server-runtime";
import { useLoaderData } from "remix";
import { DocumentClass } from "~/features/apiReference/components/DocumentClass";

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
    <>
      <h1>Core API</h1>

      <DocumentClass classDef={generatedTypes?.RefinerDB} />
    </>
  );
}
