import React from "react";
import { Navigation } from "./Navigation";

export function Layout({
  children,
}: React.PropsWithChildren<{ sidebar?: React.ReactNode }>) {
  return (
    <div
      className="grid layout bg-neutral-focus"
      style={{ gridTemplateColumns: "260px 1fr" }}
    >
      <aside
        id="grid-left"
        className="sticky top-0 self-start h-screen overflow-auto grid-sidebar bg-neutral"
        title="Site Navigation"
      >
        <Navigation />
      </aside>
      <main id="grid-main" className="p-8 ">
        {children}
      </main>
    </div>
  );
}
