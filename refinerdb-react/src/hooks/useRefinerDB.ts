import RefinerDB, { RefinerDBConfig, IndexState } from "refinerdb";
import { useContext } from "react";
import { RefinerDBNameContext, getDbByName } from "RefinerDBProvider";

export default function useRefinerDB() {
  let dbName = useContext(RefinerDBNameContext);
  console.log("TCL: useRefinerDB -> dbName", dbName);
  if (dbName) {
    return getDbByName(dbName);
  }
  return null;
}
