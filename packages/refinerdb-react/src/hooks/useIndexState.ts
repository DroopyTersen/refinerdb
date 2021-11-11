import { useContext } from "react";
import { IndexStateContext } from "../RefinerDBProvider";

export function useIndexState() {
  return useContext(IndexStateContext);
}
