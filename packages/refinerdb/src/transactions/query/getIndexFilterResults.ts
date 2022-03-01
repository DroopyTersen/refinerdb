import { Filter, IndexConfig, IndexFilterResult, PersistedCollection, SearchIndex } from "../..";
import { filterToString, parseFilter } from "../../helpers/filterParser";
import { finders } from "../../helpers/finders";

/**
For each indexRegistration, we want to build an ordered set of itemIds that match the 
filter value for that index.
- If there is no active filter for the index, return all indexed itemIds(sorted).
- Eventually we'll then apply an "intersection" operation to all of the sets to come up with the filtered itemIds
- We need do create results per index so the we can quickly calculate refiner options and counts
  - Each refiner requires removing the active refiner from the filter 
*/

export async function getIndexFilterResults(
  indexRegistrations: IndexConfig[],
  filter: Filter,
  persistedFilterResults: PersistedCollection<IndexFilterResult>,
  allIndexes: SearchIndex[]
): Promise<IndexFilterResult[]> {
  // Get an array of arrays. where we store a set of itemId matches for each filter
  let indexFilters = parseFilter(filter);
  let indexFilterResults: IndexFilterResult[] = [];
  let indexData = indexRegistrations.map((indexDefinition) => {
    let indexFilter = indexFilters.find((f) => f.indexKey === indexDefinition.key) || {
      indexKey: indexDefinition.key,
    };

    return {
      indexFilter,
      indexDefinition,
      filterKey: filterToString(indexFilter),
    };
  });
  let cachedFilterResults = await persistedFilterResults.bulkGet(indexData.map((i) => i.filterKey));
  indexData.forEach(({ indexDefinition, indexFilter, filterKey }, i) => {
    let matches = [];
    let cachedFilterResult = cachedFilterResults[i];
    if (cachedFilterResult && cachedFilterResult.matches) {
      matches = cachedFilterResult.matches;
    } else {
      // Query the index for any matches based on the active filter value
      matches = finders.findByIndexFilter(
        { indexDefinition, ...indexFilter },
        allIndexes.find((i) => i.key === indexFilter.indexKey)
      );
      // Cache the results for next time in case the filter key matches
      persistedFilterResults.put({ key: filterKey, matches, indexKey: indexFilter.indexKey });
    }
    indexFilterResults.push({
      indexKey: indexFilter.indexKey,
      key: filterKey,
      matches,
    });
  });

  return indexFilterResults;
}
