import { useContext } from "react";
import { RefinerDB } from "refinerdb";
import { RefinerDBContext } from "../RefinerDBProvider";

/** Provides raw access to the RefinerDB instance created by the RefinerDBProvider */
export function useRefinerDB(): RefinerDB {
  return useContext(RefinerDBContext);
}
