import { useContext } from "react";
import { RefinerDBNameContext, getDbByName } from "../RefinerDBProvider";

export default function useRefinerDB() {
  let dbName = useContext(RefinerDBNameContext);
  if (dbName) {
    return getDbByName(dbName);
  }
  return null;
}
