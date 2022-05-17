import { GT } from "../generatedTypes.types";
import { DocumentMethods } from "./DocumentMethods";
import { DocumentProperties } from "./DocumentProperties";
import { DocumentType } from "./DocumentType";

interface DocumentClassProps {
  classDef: GT.Class;
  children?: React.ReactNode;
  /** The css class */
  className?: string;
}

export function DocumentClass({
  classDef,
  children,
  className = "",
}: DocumentClassProps) {
  if (!classDef) return null;
  let methods = [
    classDef?.constructorType,
    ...(classDef?.methods?.filter((method) => method.flags.isPublic) || []),
  ].filter(Boolean);
  return (
    <DocumentType className={className} typeDefinition={classDef}>
      {children}
      {methods.length > 0 && <DocumentMethods methods={methods} />}
      {classDef?.properties?.length > 0 && (
        <DocumentProperties properties={classDef?.properties} className="my-12" />
      )}
    </DocumentType>
  );
}
