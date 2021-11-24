import { GT } from "../generatedTypes.types";
import { PropsTable, PropsTableProperty } from "./PropsTable";

interface DocumentMethodsProps {
  methods: GT.Method[];
}

export function DocumentMethods({ methods }: DocumentMethodsProps) {
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
    <>
      <h3 className="mt-3 text-xl">Methods</h3>

      <PropsTable properties={tableProperties} />
    </>
  );
}
