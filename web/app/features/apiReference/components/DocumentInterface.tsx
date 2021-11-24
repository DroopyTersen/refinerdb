import { GT } from "../generatedTypes.types";
import { DocumentMethods } from "./DocumentMethods";
import { DocumentProperties } from "./DocumentProperties";

interface DocumentInterfaceProps {
  interfaceDef: GT.Interface;
  children?: React.ReactNode;
}

export function DocumentInterface({ interfaceDef, children }: DocumentInterfaceProps) {
  let methods = [
    ...(interfaceDef?.methods?.filter((method) => method.flags.isPublic) || []),
  ].filter(Boolean);
  return (
    <>
      <h2 id={interfaceDef.name.toLowerCase()} className="mt-12 mb-4 text-2xl font-bold">
        {interfaceDef.name}
      </h2>

      {interfaceDef?.documentation?.contentsRaw && (
        <p className="mt-4 mb-8">{interfaceDef?.documentation?.contentsRaw}</p>
      )}

      {children}

      {methods.length > 0 && <DocumentMethods methods={methods} />}
      {interfaceDef?.properties?.length > 0 && (
        <DocumentProperties properties={interfaceDef?.properties} />
      )}
    </>
  );
}
