import { GT } from "../generatedTypes.types";

interface Props {
  typeDefinition: GT.Base;
  children?: React.ReactNode;
  /** The css class */
  className?: string;
}

export function DocumentType({
  typeDefinition: typeDefinition,
  children,
  className = "",
}: Props) {
  if (!typeDefinition) return null;

  return (
    <div className={"py-6 " + className} id={typeDefinition.name.toLowerCase()}>
      <a
        href={"#" + typeDefinition.name.toLowerCase()}
        className="flex btn btn-secondary"
        style={{ textTransform: "none" }}
      >
        <h2 className="inline m-0 font-mono">{typeDefinition.name}</h2>
      </a>
      {typeDefinition?.documentation?.contentsRaw && (
        <p className="my-8 text-lg">{typeDefinition?.documentation?.contentsRaw}</p>
      )}

      {children}
    </div>
  );
}
