import React from "react";
import useIndexState from "hooks/useIndexState";

export interface HeaderProps {
  // props
  className?: string;
  [key: string]: any;
}

export default function Header({ title, children }) {
  let indexState = useIndexState();
  console.log("RENDERING Header", indexState.status);
  return (
    <header
      className="rdb-header"
      style={{ display: "flex", justifyContent: "space-between", position: "relative" }}
    >
      <h1>
        {title} <code>{indexState.status}</code>
      </h1>
      <div>{children}</div>
    </header>
  );
}
