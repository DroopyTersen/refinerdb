import { GT } from "../generatedTypes.types";
import { DocumentType } from "./DocumentType";
import { PropsTable } from "./PropsTable";

interface DocumentEnumProps {
  enumDef: GT.Enum;
  className?: string;
}

export function DocumentEnum({ enumDef, className = "" }: DocumentEnumProps) {
  let tableProperties = enumDef.members
    .map((member) => {
      return {
        name: member.name,
        type: "IndexType." + member.name,
        description: member?.documentation?.contentsRaw,
      };
    })
    .filter(Boolean);

  return (
    <DocumentType className={className} typeDefinition={enumDef}>
      <PropsTable properties={tableProperties} />
    </DocumentType>
  );
}
