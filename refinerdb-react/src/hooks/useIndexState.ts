import { useContext } from "react";
import { IndexStateContext } from "RefinerDBProvider";

export default function useIndexState() {
  return useContext(IndexStateContext);
}
