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
          className="grid items-center gap-2 py-6 border-b min-h-12"
          style={{ gridTemplateColumns: "200px 120px 1fr", gridTemplateRows: "40px 1fr" }}
          key={name}
        >
          <div className="flex items-center font-mono text-lg font-bold name">{name}</div>
          <div
            className={`flex items-center ${
              isRequired === "Required" ? "text-primary" : ""
            }`}
          >
            {isRequired}
          </div>
          <div className="flex items-center text-sm type">
            <code className="text-secondary">{type}</code>
          </div>
          {description && (
            <div className="py-3 description" style={{ gridColumn: "1/4" }}>
              {description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
