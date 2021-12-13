import { useEffect, useRef } from "react";
import { IndexState } from "refinerdb";
import { useRefinerDB } from ".";

type EffectFn = (status: IndexState) => (() => void) | void;

export function useIndexStatus(effectFn: EffectFn) {
  let effectRef = useRef(effectFn);
  let refinerDB = useRefinerDB();

  useEffect(() => {
    effectRef.current = effectFn;
  }, [effectFn]);

  useEffect(() => {
    let cleanup = refinerDB.onTransition((status) => {
      effectRef.current?.(status);
    });

    effectFn(refinerDB.getIndexState());

    return cleanup;
  }, [refinerDB]);
}
