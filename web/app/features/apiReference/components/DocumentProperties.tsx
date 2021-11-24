import { GT } from "../generatedTypes.types";
import { PropsTable, PropsTableProperty } from "./PropsTable";

interface DocumentPropertiesProps {
  properties: GT.Property[];
}

export function DocumentProperties({ properties }: DocumentPropertiesProps) {
  let propTableProperties: PropsTableProperty[] = properties.map((typeProperty) => {
    return {
      name: typeProperty.name,
      description: typeProperty?.documentation?.contentsRaw,
      type: typeProperty.type,
      isRequired: typeProperty.flags.isOptional ? "Optional" : "Required",
    };
  });
  return (
    <>
      <h3 className="mt-3 text-xl">Properties</h3>
      <PropsTable properties={propTableProperties} />
    </>
  );
}
