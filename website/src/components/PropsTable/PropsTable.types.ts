export interface PropsTableProps {
  /** Optional override to pass in your own props */
  properties?: PropsTableProperty[];
}

export interface PropsTableProperty {
  name: string;
  description?: string;
  isRequired: "Required" | "Optional";
  type: string;
}
