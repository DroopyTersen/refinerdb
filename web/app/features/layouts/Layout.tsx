import React from "react";
import { Navigation } from "./Navigation";

export function Layout({
  children,
  sidebar,
}: React.PropsWithChildren<{ sidebar?: React.ReactNode }>) {
  return (
    <div className="layout bg-neutral-focus">
      <header className="flex items-center px-8"></header>
      <aside
        id="grid-left"
        className="sticky top-0 self-start h-screen overflow-y-auto grid-sidebar bg-neutral"
        title="Site Navigation"
      >
        <Navigation />
      </aside>
      <main id="grid-main" className="p-8">
        {children}
      </main>
      {sidebar && (
        <aside id="grid-right" className="p-8 grid-sidebar" title="Table of Contents">
          {sidebar}
        </aside>
      )}
    </div>
  );
}
