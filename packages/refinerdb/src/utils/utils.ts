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
export default function createMeasurement(name: string) {
  if (!_enableMeasurements || typeof performance === "undefined" || !performance?.mark) {
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
      console.log(
        `RefinerDB ⏱ \t ${entry?.name
          ?.replace(":measure", "")
          .padEnd(50, " ")} ${entry?.duration.toFixed(2).toString().padStart(6, " ")}ms`
      )
    );
  };

  return { start, stop };
}

export function intersection(allArrays: any[][] = []) {
  // take the first item off the array of arrays
  let firstArray = allArrays.shift() || [];

  return firstArray.filter((currentItem) =>
    allArrays.every((array = []) => array.includes(currentItem))
  );
}
