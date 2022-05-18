// EXAMPLE USAGE
// let measurement = createMeasurement("Calculate Refiner Options");

// measurement.start();
// await api.calculateRefinerOptions();

// //This will log the measurement name and duration
// measurement.stop();
let _enableMeasurements = false;

export const setEnableMeasurements = (value: boolean) => {
  _enableMeasurements = value;
};

if (typeof window !== "undefined") {
  (window as any)._setEnableMeasurements = setEnableMeasurements;
}

export default function createMeasurement(name: string) {
  if (!_enableMeasurements || typeof performance === "undefined" || !performance?.mark) {
    return {
      start: () => {},
      stop: () => {},
    };
  }
  let now = Date.now();
  let startKey = name + ":start-" + now;
  let stopKey = name + ":stop-" + now;
  let measureKey = name + ":measure-" + now;

  let start = () => performance.mark(startKey);
  let stop = () => {
    performance?.mark?.(stopKey);
    performance?.measure?.(measureKey, startKey, stopKey);
    let entries = performance?.getEntriesByName?.(measureKey);
    entries.forEach((entry) =>
      console.log(
        `RefinerDB ⏱ \t ${entry?.name
          ?.split(":measure")?.[0]
          .padEnd(40, " ")} ${entry?.duration.toFixed(2).toString().padStart(6, " ")}ms`
      )
    );
  };

  return { start, stop };
}

export function intersection(allArrays: any[][] = []) {
  // take the first item off the array of arrays
  allArrays = allArrays.filter((a) => a?.includes);
  let firstArray = allArrays.shift() || [];

  return firstArray.filter((currentItem) =>
    allArrays.every((array = []) => array.includes(currentItem))
  );
}

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function serializeFunction(fn: Function) {
  if (!fn) return "";
  return fn.toString();
}

export function deserializeFunction(serializedFn: string) {
  if (!serializedFn) return undefined;
  if (typeof serializedFn !== "string") return serializedFn;

  return new Function(`return ${serializedFn}`)();
}
