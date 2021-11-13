import React, { useEffect, useState } from "react";
import {
  RefinerDB,
  IndexConfig,
  IndexState,
  PersistedStore,
  QueryCriteria,
  RefinerDBConfig,
} from "refinerdb";
import { useRefinerDB } from ".";
import { useUpdateEffect } from "./hooks/utils/useUpdateEffect";

export const RefinerDBContext = React.createContext<RefinerDB>(null);
export const IndexStateContext = React.createContext<{ status: IndexState }>({
  status: IndexState.IDLE,
});

export interface RefinerDBProviderProps {
  name: string;
  items: any[];
  store?: PersistedStore;
  indexes?: IndexConfig[];
  criteria?: QueryCriteria;
}
const RefinerDBProvider: React.FC<RefinerDBProviderProps> = ({
  name,
  children,
  items,
  store,
  indexes,
  criteria,
}) => {
  let [indexState, setIndexState] = useState(IndexState.IDLE);
  let [refinerDB] = useState<RefinerDB>(() => {
    let dbConfig: RefinerDBConfig = {
      onTransition: (state) => {
        setIndexState(state);
      },
      indexDelay: 500,
      indexes: indexes,
      store,
      criteria,
    };
    let refinerDB = new RefinerDB(name, dbConfig);
    if (items) {
      refinerDB.setItems(items);
    }
    return refinerDB;
  });

  return (
    <RefinerDBContext.Provider value={refinerDB}>
      <IndexStateContext.Provider value={{ status: indexState }}>
        <ItemsWrapper items={items || null} />
        <IndexesWrapper indexes={indexes || null} />
        {children}
      </IndexStateContext.Provider>
    </RefinerDBContext.Provider>
  );
};

function IndexesWrapper({ indexes }) {
  let refinerDB = useRefinerDB();
  useEffect(() => {
    if (refinerDB && indexes) {
      refinerDB.setIndexes(indexes);
    }
  }, [indexes]);
  return null;
}

function ItemsWrapper({ items }) {
  let refinerDB = useRefinerDB();
  // TODO: do this better. only want the delay on mount
  useUpdateEffect(() => {
    if (refinerDB && items) {
      refinerDB.setItems(items);
    }
  }, [items]);
  return null;
}

export default RefinerDBProvider;
