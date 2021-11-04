import React from "react";
import { IndexConfig } from "refinerdb";
import { RefinerDBProvider } from "..";
import { ResultInspector } from "../components/results";
import { DataSetupButton } from "./DataSetupButton";

export interface DemoSetupProps {
  dbName: string;
  worker?: Worker;
  getItems: () => Promise<any[]>;
  indexes: IndexConfig[];
  children: React.ReactNode;
}

export function DemoSetup({ dbName, worker, getItems, indexes, children }: DemoSetupProps) {
  return (
    <RefinerDBProvider name={dbName} worker={worker}>
      <header>
        <DataSetupButton indexes={indexes} getItems={getItems} />
        <ResultInspector />
      </header>
      {children}
    </RefinerDBProvider>
  );
}
