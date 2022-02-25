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
    // We only want to potentially delay on the first render
    const doAsync = async (delay = 0) => {
      let indexCount = refinerDB?.indexRegistrations?.length;
      // delay setting the indexRegistrations if we have some in cache
      // this way the user will see the cached items first
      // and the reindexing will be in the background
      if (indexCount && indexCount > 0) {
        await wait(delay);
      }
      if (!hasUnmounted) {
        refinerDB.setIndexes(indexes);
      }
    };
    if (indexes && refinerDB) {
      doAsync(isFirstPassRef.current ? 1800 : 0);
    }

    return () => {
      hasUnmounted = true;
    };
  }, [indexes, refinerDB]);

  useEffect(() => {
    if (isFirstPassRef.current) {
      isFirstPassRef.current = false;
    }
  }, [refinerDB]);

  return null;
}
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function ItemsWrapper({ items }) {
  const isFirstPassRef = useRef(true);
  let refinerDB = useRefinerDB();

  useEffect(() => {
    let hasUnmounted = false;
    // We only want to potentially delay on the first render
    const doAsync = async (delay = 0) => {
      let itemCount = await refinerDB.getItemCount();
      // delay setting the items if we have some in cache
      // this way the user will see the cached items first
      // and the reindexing will be in the background
      if (itemCount && itemCount > 0) {
        await wait(delay);
      }
      if (!hasUnmounted) {
        refinerDB.setItems(items);
      }
    };
    if (items) {
      doAsync(isFirstPassRef.current ? 2000 : 0);
    }

    return () => {
      hasUnmounted = true;
    };
  }, [items, refinerDB]);

  useEffect(() => {
    if (isFirstPassRef.current) {
      isFirstPassRef.current = false;
    }
  }, [refinerDB]);

  return null;
}
