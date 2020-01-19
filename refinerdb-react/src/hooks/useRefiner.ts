import useQueryResult from "./useQueryResult";
import {
  IndexFilter,
  StringFilterValue,
  NumberFilterValue,
  MinMaxFilterValue,
  RefinerOption,
} from "refinerdb";
import useRefinerDB from "./useRefinerDB";

export default function useRefiner(key: string) {
  let refinerDB = useRefinerDB();
  let result = useQueryResult();

  let criteria = { filter: {}, ...refinerDB.criteria };

  let update = (newVal: StringFilterValue | NumberFilterValue | MinMaxFilterValue) => {
    if (!criteria.filter) {
      criteria.filter = {};
    }
    criteria.filter[key] = newVal;
    refinerDB.setCriteria(criteria);
  };

  return {
    filter: criteria && criteria.filter ? criteria.filter[key] : null,
    options: result && result.refiners ? result.refiners[key] : [],
    update,
  } as {
    filter: MinMaxFilterValue | StringFilterValue | NumberFilterValue;
    options: RefinerOption[];
    update: (newVal: StringFilterValue | NumberFilterValue | MinMaxFilterValue) => void;
  };
}
