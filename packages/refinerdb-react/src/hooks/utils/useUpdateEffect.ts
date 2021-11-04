import { useEffect, useRef } from "react";

export const useUpdateEffect = (effectFn, dependencies) => {
  const effectFnRef = useRef(effectFn);
  const hasMountedRef = useRef(false);
  useEffect(() => {
    effectFnRef.current = effectFn;
  });

  useEffect(() => {
    if (hasMountedRef.current) {
      return effectFn();
    }
  }, dependencies);

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);
};
