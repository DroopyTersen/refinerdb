import React, { useEffect, useRef, useState } from "react";
import { IndexState, RefinerDB, RefinerDBConfig } from "refinerdb";
import { useRefinerDB } from ".";

export const RefinerDBContext = React.createContext<RefinerDB>(null);
export const IndexStateContext = React.createContext<{ status: IndexState }>({
  status: IndexState.IDLE,
});

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
      indexes,
      onTransition: (state) => {
        setIndexState(state);
        if (refinerDBConfig.onTransition) {
          refinerDBConfig.onTransition(state);
        }
      },
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
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// async function setupItems(refinerDB: RefinerDB, items: any[], isFirstRender = false) {
//   if (isFirstRender) {
//     let itemCount = await refinerDB.getItemCount();
//     if (itemCount && itemCount > 0 ) {
//       await wait(2000);
//     }
//   }
//   return refinerDB.setItems(items);
// }

// function ItemsSetup({ items }) {
//   let refinerDB = useRefinerDB();
//   useEffect(() => {
//     setupItems(refinerDB, items);
//   }, [refinerDB, items]);

//   return null;
// }

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
        await wait(2000);
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
