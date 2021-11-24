import { GT } from "../generatedTypes.types";
import { PropsTable, PropsTableProperty } from "./PropsTable";

interface DocumentMethodsProps {
  methods: GT.Method[];
  className?: string;
}

export function DocumentMethods({ methods, className = "" }: DocumentMethodsProps) {
  let tableProperties: PropsTableProperty[] = methods.filter(Boolean).map((method) => {
    let tableProperty: PropsTableProperty = {
      name: method.name,
      description: method?.documentation?.contentsRaw,
      isRequired: "Required",
      type: method?.signatures?.[0]?.type,
    };
    return tableProperty;
  });

  return (
    <div className={className}>
      <h3 className="mt-3 text-xl text-accent">Methods</h3>

      <PropsTable properties={tableProperties} />
    </div>
  );
}
