import React from "react";
import useIndexState from "hooks/useIndexState";

export interface HeaderProps {
  // props
  className?: string;
  [key: string]: any;
}

export default function Header() {
  let indexState = useIndexState();
  console.log("RENDERING Header", indexState.status);
  return (
    <header>
      <h2>
        Index Status <code>{indexState.status}</code>
      </h2>
    </header>
  );
}
