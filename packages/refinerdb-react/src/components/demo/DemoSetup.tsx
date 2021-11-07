import React, { useEffect } from "react";
import { IndexConfig } from "refinerdb";
import { RefinerDBProvider } from "../..";
import { ResultInspector } from "../results";

export interface DemoSetupProps {
  dbName: string;
  worker?: Worker;
  getItems: () => Promise<any[]>;
  indexes: IndexConfig[];
  children: React.ReactNode;
  hydrateItems?: boolean;
}

function useAsyncData<T>(getItems: () => Promise<T[]>) {
  const [items, setItems] = React.useState<T[]>(null);

  const refreshData = async () => {
    let isUnmounted = false;
    let newItems = await getItems();
    if (isUnmounted) return;

    setItems(newItems);
    return () => {
      isUnmounted = true;
    };
  };

  useEffect(() => {
    let isUnmounted = false;
    let doAsync = async () => {
      let newItems = await getItems();
      if (isUnmounted) return;

      setItems(newItems);
    };

    doAsync();
    return () => {
      isUnmounted = true;
    };
  }, []);

  return [items, refreshData] as [T[], () => void];
}

export function DemoSetup({
  dbName,
  worker,
  getItems,
  indexes,
  children,
  hydrateItems,
}: DemoSetupProps) {
  let [items, refreshData] = useAsyncData(getItems);
  return (
    <RefinerDBProvider name={dbName} worker={worker} indexes={indexes} items={items}>
      <header>
        <button onClick={() => refreshData()}>Refresh Data</button>
        <ResultInspector hydrateItems={hydrateItems} />
      </header>
      {children}
    </RefinerDBProvider>
  );
}
