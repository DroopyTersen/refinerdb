import { useContext } from "react";
import { RefinerDBContext } from "../RefinerDBProvider";

export default function useRefinerDB() {
  return useContext(RefinerDBContext);
}
