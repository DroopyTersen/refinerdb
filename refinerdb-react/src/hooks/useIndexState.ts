import { useContext } from "react";
import { IndexStateContext } from "RefinerDBProvider";

export default function useIndexState() {
  let data = useContext(IndexStateContext);
  return data;
}
