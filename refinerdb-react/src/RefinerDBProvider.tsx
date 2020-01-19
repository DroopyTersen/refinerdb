import { useState, useEffect, useMemo, useContext } from "react";
import React from "react";
import RefinerDB, { RefinerDBConfig, IndexState } from "refinerdb";

declare global {
  interface Window {
    __refinerDBs: {
      [key: string]: RefinerDB;
    };
  }
}

export const getDbByName = function(name): RefinerDB {
  window.__refinerDBs = window.__refinerDBs || {};
  let db = window.__refinerDBs[name];
  return db;
};

const createDb = function(name, config: RefinerDBConfig) {
  let db = new RefinerDB(name, config);
  window.__refinerDBs = window.__refinerDBs || {};
  window.__refinerDBs[name] = db;
  console.log("HERE I AM", db);
};

const deleteDb = function(name) {
  let existingDb = getDbByName(name) as any;

  if (existingDb) {
    delete window.__refinerDBs[name];
    RefinerDB.destroy(name);
  }
};

export const RefinerDBNameContext = React.createContext<string>(null);
export const IndexStateContext = React.createContext<{ status: IndexState }>({
  status: IndexState.IDLE,
});

export interface RefinerDBProviderProps {
  name: string;
  workerPath?: string;
}
const RefinerDBProvider: React.FC<RefinerDBProviderProps> = ({
  name,
  children,
  workerPath = "",
}) => {
  let [indexState, setIndexState] = useState(IndexState.IDLE);
  let dbConfig: RefinerDBConfig = {
    workerPath,
    onTransition: (state) => {
      setIndexState(state);
    },
    indexDelay: 500,
  };
  // TODO: this feels not good at all...
  let db = getDbByName(name);
  if (!db) {
    createDb(name, dbConfig);
  }

  return (
    <RefinerDBNameContext.Provider value={name}>
      <IndexStateContext.Provider value={{ status: indexState }}>
        {children}
      </IndexStateContext.Provider>
    </RefinerDBNameContext.Provider>
  );
};

export default RefinerDBProvider;
