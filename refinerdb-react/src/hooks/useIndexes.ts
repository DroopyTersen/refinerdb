import useRefinerDB from "./useRefinerDB";
import { IndexConfig } from "refinerdb";

export default function useIndexes() {
  let refinerDB = useRefinerDB();

  return (refinerDB ? [refinerDB.indexRegistrations, refinerDB.setIndexes] : [null, null]) as [
    IndexConfig[],
    (indexes: IndexConfig[]) => void
  ];
}
