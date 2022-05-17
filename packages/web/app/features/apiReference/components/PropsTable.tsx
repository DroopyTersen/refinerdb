export interface PropsTableProps {
  properties?: PropsTableProperty[];
}

export interface PropsTableProperty {
  name: string;
  description?: string;
  isRequired?: "Required" | "Optional" | "";
  type: string;
}

export function PropsTable({ properties }: PropsTableProps) {
  return (
    <div className="max-w-3xl px-6 py-2 rounded props-table bg-neutral">
      {properties.map(({ name, description, type, isRequired = "" }) => (
        <div
          className="grid items-center gap-2 py-2 border-b border-neutral-focus min-h-12"
          style={{
            gridTemplateColumns: "200px 1fr 120px",
            gridTemplateRows: "40px 1fr",
          }}
          key={name}
        >
          <div className="flex items-center font-mono font-bold name">{name}</div>
          <div className="flex items-center pr-2 text-sm type">
            <code className="">{type}</code>
          </div>
          <div
            className={`flex items-center ${
              isRequired === "Required" ? "text-primary" : ""
            }`}
          >
            {isRequired}
          </div>
          {description && (
            <div className="mb-4 text-gray-300 description" style={{ gridColumn: "2/4" }}>
              {description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
