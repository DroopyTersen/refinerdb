import React, { useEffect, useRef, useState } from "react";
import { IndexState, RefinerDB, RefinerDBConfig } from "refinerdb";
import { useRefinerDB } from ".";

export const RefinerDBContext = React.createContext<RefinerDB>(null);

export interface RefinerDBProviderProps extends RefinerDBConfig {
  name: string;
  items: any[];
}
export const RefinerDBProvider: React.FC<RefinerDBProviderProps> = ({
  name,
  items,
  children,
  indexes,
  ...refinerDBConfig
}) => {
  let [indexState, setIndexState] = useState(IndexState.IDLE);
  let [refinerDB] = useState<RefinerDB>(() => {
    let dbConfig: RefinerDBConfig = {
      indexDelay: 500,
      ...refinerDBConfig,
      onTransition: (state) => {
        setIndexState(state);
        if (refinerDBConfig.onTransition) {
          refinerDBConfig.onTransition(state);
        }
      },
    };
    let refinerDB = new RefinerDB(name, dbConfig);
    return refinerDB;
  });

  return (
    <RefinerDBContext.Provider value={refinerDB}>
      <ItemsWrapper items={items || null} />
      <IndexesWrapper indexes={indexes || null} />
      {children}
    </RefinerDBContext.Provider>
  );
};

function IndexesWrapper({ indexes }) {
  let refinerDB = useRefinerDB();
  const isFirstPassRef = useRef(true);

  useEffect(() => {
    let hasUnmounted = false;
    const doAsync = async () => {
      if (isFirstPassRef.current) {
        let indexCount = refinerDB?.indexRegistrations?.length;
        if (indexCount && indexCount > 0) {
          await wait(1800);
        }
      }
      if (!hasUnmounted) {
        refinerDB.setIndexes(indexes);
      }
      if (isFirstPassRef.current) {
        isFirstPassRef.current = false;
      }
    };
    if (indexes && refinerDB) {
      doAsync();
    }

    return () => {
      hasUnmounted = true;
    };
  }, [indexes, refinerDB]);

  return null;
}
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function ItemsWrapper({ items }) {
  const isFirstPassRef = useRef(true);
  let refinerDB = useRefinerDB();

  useEffect(() => {
    let hasUnmounted = false;
    const doAsync = async () => {
      if (isFirstPassRef.current) {
        let itemCount = await refinerDB.getItemCount();
        if (itemCount && itemCount > 0) {
          await wait(2000);
        }
      }
      if (!hasUnmounted) {
        refinerDB.setItems(items);
      }
      if (isFirstPassRef.current) {
        isFirstPassRef.current = false;
      }
    };
    if (items) {
      doAsync();
    }

    return () => {
      hasUnmounted = true;
    };
  }, [items, refinerDB]);

  return null;
}
