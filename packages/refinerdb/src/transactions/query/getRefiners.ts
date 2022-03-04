import { IndexConfig, IndexFilterResult, RefinerOption, SearchIndex } from "../..";
import { finders } from "../../helpers/finders";

type RefinerOptionsMap = {
  [indexKey: string]: RefinerOption[];
};
/**
For each index registration, calculate the refiner options
- To calculate refiner options we need to run a filter that omits the active indexFilter
- filterResults is an array of ordered Sets of itemIds (that have been already been filtered)
 */

export function getRefiners(
  indexRegistrations: IndexConfig[],
  allIndexes: SearchIndex[],
  indexFilterResults: IndexFilterResult[]
): RefinerOptionsMap {
  let refiners: RefinerOptionsMap = null;

  let allRefinerOptions = indexRegistrations.map((indexRegistration, i) => {
    if (indexRegistration.skipRefinerOptions) {
      return [];
    }
    // let measure = createMeasurement("getRefiners:" + indexRegistration.key + Date.now());
    // measure.start();
    let index = allIndexes.find((i) => i.key === indexRegistration.key);
    let refinerOptions = finders.getRefinerOptions(index, indexFilterResults);
    // measure.stop();
    return refinerOptions;
  });

  refiners = allRefinerOptions.reduce((refiners, options, i) => {
    refiners[indexRegistrations[i].key] = options;
    return refiners;
  }, {});

  return refiners;
}
