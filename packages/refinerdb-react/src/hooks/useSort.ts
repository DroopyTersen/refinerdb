import { useCriteria } from "./useCriteria";
import { useIndexes } from "./useIndexes";
import { useCallback, useMemo } from "react";
import { IndexConfig } from "refinerdb";

export function useSort() {
  let [criteria, setCriteria] = useCriteria();
  let [indexes] = useIndexes();

  const setSortKey = useCallback(
    (indexKey: string) => {
      setCriteria((prev) => ({
        ...prev,
        sort: indexKey,
      }));
    },
    [setCriteria]
  );

  const setSortDir = useCallback(
    (sortDir: "asc" | "desc") => {
      setCriteria((prev) => ({
        ...prev,
        sortDir,
      }));
    },
    [setCriteria]
  );

  const toggleDir = useCallback(() => {
    let direction: "asc" | "desc" = criteria.sortDir === "desc" ? "asc" : "desc";
    setSortDir(direction);
  }, [criteria, setSortDir]);

  const options = useMemo(() => {
    return indexes.map((indexConfig: IndexConfig) => {
      return {
        value: indexConfig.key,
        text: indexConfig.label || indexConfig.key,
      };
    });
  }, [indexes]);

  return {
    sortKey: criteria.sort || "",
    sortDir: criteria.sortDir || "asc",
    setSortKey,
    setSortDir,
    toggleDir,
    options,
  };
}
