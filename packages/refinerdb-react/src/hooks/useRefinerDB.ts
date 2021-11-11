import { useContext } from "react";
import { RefinerDBContext } from "../RefinerDBProvider";

export function useRefinerDB() {
  return useContext(RefinerDBContext);
}
