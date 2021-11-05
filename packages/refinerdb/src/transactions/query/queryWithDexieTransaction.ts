import RefinerDB, { QueryResult } from "../..";
import _query from "./_query";

export const queryWithDexieTransaction = async (
  db: RefinerDB,
  queryId: number = Date.now()
): Promise<QueryResult> => {
  let result: QueryResult = null;

  await db.transaction(
    "rw",
    db.indexes,
    db.allItems,
    db.filterResults,
    db.queryResults,
    async () => {
      result = await _query(db, queryId);
    }
  );

  return result;
};
