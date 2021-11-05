import React, { useEffect, useState } from "react";
import RefinerDB, { IndexConfig, IndexState, RefinerDBConfig } from "refinerdb";
import { useRefinerDB } from ".";
import { useUpdateEffect } from "./hooks/utils/useUpdateEffect";

export const RefinerDBContext = React.createContext<RefinerDB>(null);
export const IndexStateContext = React.createContext<{ status: IndexState }>({
  status: IndexState.IDLE,
});

export interface RefinerDBProviderProps {
  name: string;
  worker?: any;
  items: any[];
  indexes?: IndexConfig[];
}
const RefinerDBProvider: React.FC<RefinerDBProviderProps> = ({
  name,
  children,
  worker,
  items,
  indexes,
}) => {
  let [indexState, setIndexState] = useState(IndexState.IDLE);
  let [refinerDB] = useState<RefinerDB>(() => {
    let dbConfig: RefinerDBConfig = {
      worker,
      onTransition: (state) => {
        setIndexState(state);
      },
      indexDelay: 500,
      indexes: indexes,
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
    let isUnmounted = false;
    if (refinerDB && items) {
      refinerDB.allItems.count().then((count) => {
        if (isUnmounted) return;
        if (!count) {
          refinerDB.setItems(items);
        } else {
          setTimeout(() => {
            if (!isUnmounted) {
              refinerDB.setItems(items);
            }
          }, 2000);
        }
      });
    }

    return () => {
      isUnmounted = true;
    };
  }, [items]);
  return null;
}

export default RefinerDBProvider;
