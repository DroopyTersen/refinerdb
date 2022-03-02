import React, { useEffect } from "react";
import { IndexConfig, PersistedStore, QueryCriteria } from "refinerdb";
import { RefinerDBProvider } from "../..";
import { ResultInspector } from "../results";

export interface DemoSetupProps {
  dbName: string;
  getItems: () => Promise<any[]>;
  indexes: IndexConfig[];
  children: React.ReactNode;
  hydrateItems?: boolean;
  store?: PersistedStore;
  criteria?: QueryCriteria;
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
  getItems,
  indexes,
  children,
  hydrateItems,
  store,
  criteria,
}: DemoSetupProps) {
  let [items, refreshData] = useAsyncData(getItems);
  return (
    <RefinerDBProvider
      name={dbName}
      indexes={indexes}
      items={items}
      criteria={criteria}
      store={store}
      enableMeasurements={true}
    >
      <header>
        <button onClick={() => refreshData()}>Refresh Data</button>
        <ResultInspector hydrateItems={hydrateItems} />
      </header>
      {children}
    </RefinerDBProvider>
  );
}
