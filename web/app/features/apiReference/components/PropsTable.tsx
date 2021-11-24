export interface PropsTableProps {
  properties?: PropsTableProperty[];
}

export interface PropsTableProperty {
  name: string;
  description?: string;
  isRequired: "Required" | "Optional";
  type: string;
}

export function PropsTable({ properties }: PropsTableProps) {
  return (
    <div className="props-table">
      {properties.map(({ name, description, type, isRequired }) => (
        <div
          className="grid items-center gap-2 py-3 border-b min-h-12"
          style={{ gridTemplateColumns: "200px 120px 1fr", gridTemplateRows: "40px 1fr" }}
          key={name}
        >
          <div className="flex items-center text-lg font-bold name tigh">{name}</div>
          <div
            className={`flex items-center ${
              isRequired === "Required" ? "text-red-800 font-bold" : ""
            }`}
          >
            {isRequired}
          </div>
          <div className="flex items-center text-sm type">
            <code>{type}</code>
          </div>
          <div className="text-sm description">{description}</div>
        </div>
      ))}
    </div>
  );
}
