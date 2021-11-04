import React from "react";

export function Fieldset({ label, children }) {
  return (
    <fieldset style={{ width: "100%", boxSizing: "border-box", margin: "0", padding: "1rem" }}>
      <legend>{label}</legend>
      {children}
    </fieldset>
  );
}
