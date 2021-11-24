import { GT } from "../generatedTypes.types";
import { PropsTable, PropsTableProperty } from "./PropsTable";

interface DocumentPropertiesProps {
  properties: GT.Property[];
  className?: string;
}

export function DocumentProperties({
  properties,
  className = "",
}: DocumentPropertiesProps) {
  let propTableProperties: PropsTableProperty[] = properties.map((typeProperty) => {
    return {
      name: typeProperty.name,
      description: typeProperty?.documentation?.contentsRaw,
      type: typeProperty.type,
      isRequired: typeProperty.flags.isOptional ? "Optional" : "Required",
    };
  });
  return (
    <div className={className}>
      <h3 className="mt-3 text-xl text-accent">Properties</h3>
      <PropsTable properties={propTableProperties} />
    </div>
  );
}
