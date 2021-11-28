import React, { useEffect, useRef, useState } from "react";
import {
  IndexConfig,
  IndexState,
  PersistedStore,
  QueryCriteria,
  RefinerDB,
  RefinerDBConfig,
} from "refinerdb";
import { useRefinerDB } from ".";

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
  const hasMountedRef = useRef(false);
  let refinerDB = useRefinerDB();

  useEffect(() => {
    let hasUnmounted = false;
    if (items && !hasMountedRef.current) {
      // Only delay the initial setItem if it is the first
      // render pass and we already have items. This gives
      // react a chance to render with the cached items before
      // reindexing.
      setTimeout(() => {
        if (hasUnmounted) return;
        refinerDB.setItems(items);
      }, 350);
    } else if (items && hasMountedRef.current) {
      refinerDB.setItems(items).then(() => {
        refinerDB.getItemCount().then((count) => console.log("ITEM COUNT", count));
        refinerDB.getQueryResult(false).then((result) => console.log("result", result));
      });
    }

    return () => {
      hasUnmounted = true;
    };
  }, [items, refinerDB]);

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  return null;
}

export default RefinerDBProvider;
