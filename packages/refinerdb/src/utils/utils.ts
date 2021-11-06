// EXAMPLE USAGE
// let measurement = createMeasurement("Calculate Refiner Options");

// measurement.start();
// await api.calculateRefinerOptions();

// //This will log the measurement name and duration
// measurement.stop();
export default function createMeasurement(name: string) {
  if (typeof performance === "undefined" || !performance?.mark) {
    return {
      start: () => {},
      stop: () => {},
    };
  }
  let startKey = name + ":start";
  let stopKey = name + ":stop";
  let measureKey = name + ":measure";

  let start = () => performance.mark(startKey);
  let stop = () => {
    performance?.mark?.(stopKey);
    performance?.measure?.(measureKey, startKey, stopKey);
    let entries = performance?.getEntriesByName?.(measureKey);
    entries.forEach((entry) =>
      console.log("MEASUREMENT (milliseconds)", entry.name, entry.duration)
    );
  };

  return { start, stop };
}

export function intersection(...allArrays) {
  let [firstArray, ...arrays] = allArrays;
  firstArray = firstArray || [];
  arrays = arrays || [];
  let result = [];

  for (let i = 0; i < firstArray.length; i++) {
    let currentValue = firstArray[i];
    let isInAllArrays = arrays.every((array) => array.includes(currentValue));
    if (isInAllArrays) {
      result.push(currentValue);
    }
  }
  return result;
}

export async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
