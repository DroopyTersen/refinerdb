import { GT } from "../generatedTypes.types";
import { DocumentMethods } from "./DocumentMethods";
import { DocumentProperties } from "./DocumentProperties";

interface DocumentClassProps {
  classDef: GT.Class;
  children?: React.ReactNode;
}

export function DocumentClass({ classDef, children }: DocumentClassProps) {
  let methods = [
    classDef?.constructorType,
    ...(classDef?.methods?.filter((method) => method.flags.isPublic) || []),
  ].filter(Boolean);
  return (
    <>
      <h2 id={classDef.name.toLowerCase()} className="">
        {classDef.name}
      </h2>

      {classDef?.documentation?.contentsRaw && (
        <p className="mt-4 mb-8">{classDef?.documentation?.contentsRaw}</p>
      )}

      {children}

      {methods.length > 0 && <DocumentMethods methods={methods} />}
      {classDef?.properties?.length > 0 && (
        <DocumentProperties properties={classDef?.properties} className="my-12" />
      )}
    </>
  );
}
