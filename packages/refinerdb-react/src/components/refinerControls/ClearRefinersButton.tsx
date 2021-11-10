import React from "react";
import { useFilter } from "../../hooks/useFilter";

const CLASS_NAME = "button button-outline rdb-clear-refiners";

export interface ClearRefinersButtonProps {
  // props
  className?: string;
  [key: string]: any;
}

const ClearRefinersButton: React.FC<ClearRefinersButtonProps> = ({
  children,
  className = "",
  ...additionalProps
}) => {
  let { filter, clearFilter } = useFilter();
  if (Object.keys(filter).length < 1) return null;
  return (
    <button {...additionalProps} className={"btn btn-sm"} type="button" onClick={clearFilter}>
      {children}
    </button>
  );
};

export default ClearRefinersButton;
