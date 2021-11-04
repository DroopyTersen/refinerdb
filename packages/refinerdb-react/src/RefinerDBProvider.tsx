import React, { useEffect, useState } from "react";
import RefinerDB, { IndexState, RefinerDBConfig } from "refinerdb";

// declare global {
//   interface Window {
//     __refinerDBs: {
//       [key: string]: RefinerDB;
//     };
//   }
// }

// export const getDbByName = function (name): RefinerDB {
//   window.__refinerDBs = window.__refinerDBs || {};
//   let db = window.__refinerDBs[name];
//   return db;
// };

// const createDb = function (name, config: RefinerDBConfig) {
//   let db = new RefinerDB(name, config);
//   window.__refinerDBs = window.__refinerDBs || {};
//   window.__refinerDBs[name] = db;
//   console.log("HERE I AM", db);
// };

// const deleteDb = function (name) {
//   let existingDb = getDbByName(name) as any;

//   if (existingDb) {
//     delete window.__refinerDBs[name];
//     RefinerDB.destroy(name);
//   }
// };

export const RefinerDBContext = React.createContext<RefinerDB>(null);
export const IndexStateContext = React.createContext<{ status: IndexState }>({
  status: IndexState.IDLE,
});

export interface RefinerDBProviderProps {
  name: string;
  worker?: any;
}
const RefinerDBProvider: React.FC<RefinerDBProviderProps> = ({ name, children, worker }) => {
  let [indexState, setIndexState] = useState(IndexState.IDLE);
  let [refinerDB] = useState<RefinerDB>(() => {
    let dbConfig: RefinerDBConfig = {
      worker,
      onTransition: (state) => {
        setIndexState(state);
      },
      indexDelay: 500,
    };
    return new RefinerDB(name, dbConfig);
  });

  return (
    <RefinerDBContext.Provider value={refinerDB}>
      <IndexStateContext.Provider value={{ status: indexState }}>
        {children}
      </IndexStateContext.Provider>
    </RefinerDBContext.Provider>
  );
};

export default RefinerDBProvider;
