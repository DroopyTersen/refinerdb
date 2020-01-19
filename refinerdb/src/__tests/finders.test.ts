import { finders } from "../helpers/finders";

import { IndexType, FilterResult, SearchIndex } from "../interfaces";

describe("search.finders", () => {
  describe("findByNumber", () => {
    let ratingIndex: SearchIndex = {
      key: "rating",
      type: IndexType.Number,
      sortedKeys: [0, 1, 3.1, 4, 6.2],
      value: {
        "0": [100],
        "1": [101, 1],
        "3.1": [21, 32, 54],
        "4": [21, 32, 13],
        "6.2": [6, 11],
      },
    };
    it("Should return the expected array of item keys", () => {
      let resultKeys = finders.findByNumber(ratingIndex, 2, 5);
      expect(resultKeys).toHaveLength(4);
    });

    it("Should come back with result Ids sorted by Hash value", () => {
      let resultKeys = finders.findByNumber(ratingIndex, 2, 5);
      expect(JSON.stringify(resultKeys)).toBe(JSON.stringify([21, 32, 54, 13]));
    });
  });

  describe("findByString", () => {
    let genresIndex: SearchIndex = {
      key: "genre",
      type: IndexType.String,
      sortedKeys: ["Action", "Comedy", "Drama"],
      value: {
        Action: [1, 2, 3],
        Comedy: [2, 4, 5],
        Drama: [1, 4, 6, 7, 8],
      },
    };
    it("Should support exact equals if no '*' in the filter value", () => {
      let results = finders.findByString(genresIndex, ["Comedy", "Action"]);
      expect(results).toHaveLength(5);
    });

    it("Should support 'contains' query if '*' anywhere in a filter value", () => {
      let results = finders.findByString(genresIndex, ["m*"]);
      expect(results).toHaveLength(7);
    });

    it("Should return all results if for empty string filter", () => {
      let results = finders.findByString(genresIndex, [""]);
      expect(results).toHaveLength(8);
    });
    it("Should come back sorted by the index hash values", () => {
      let titleIndex: SearchIndex = {
        key: "title",
        type: IndexType.String,
        sortedKeys: ["Apple Pie", "Bannana Pie", "Cherry Pie"],
        value: {
          "Cherry Pie": [1, 2, 3],
          "Bannana Pie": [3, 4, 5],
          "Apple Pie": [6, 7],
        },
      };
      let exactEqualsResesults = finders.findByString(titleIndex, [
        "Cherry Pie",
        "Apple Pie",
        "Bannana Pie",
      ]);
      expect(JSON.stringify(exactEqualsResesults)).toBe(JSON.stringify([6, 7, 3, 4, 5, 1, 2]));
      let containsResults = finders.findByString(titleIndex, ["pie*"]);
      expect(JSON.stringify(containsResults)).toBe(JSON.stringify([6, 7, 3, 4, 5, 1, 2]));
    });
  });

  describe("findByDate", () => {
    let dates = ["12/22/1955", "4/7/1962", "9/12/1987", "3/23/1992"].map((str) =>
      new Date(str).toISOString()
    );
    let bornIndex: SearchIndex = {
      key: "bornOnDate",
      type: IndexType.Date,
      sortedKeys: [...dates],
      value: {
        [dates[0]]: [1, 2, 8],
        [dates[1]]: [2, 4, 5],
        [dates[2]]: [1, 4, 6, 7],
        [dates[3]]: [11],
      },
    };
    it("Should return dates with the specified range", () => {
      let results = finders.findByDate(bornIndex, new Date("1/1/1990"));
      expect(results).toHaveLength(1);

      results = finders.findByDate(bornIndex, null, new Date("1/1/1990"));
      expect(results).toHaveLength(7);

      results = finders.findByDate(bornIndex, new Date("1/1/1950"), new Date("1/1/1970"));
      expect(results).toHaveLength(5);
    });
    it("Should return result Ids sorted by hash key", () => {
      let results = finders.findByDate(bornIndex, new Date("1/1/1950"), new Date("1/1/1970"));
      expect(JSON.stringify(results)).toBe(JSON.stringify([1, 2, 8, 4, 5]));
    });
  });

  describe("getRefinerOption", () => {
    let genresIndex: SearchIndex = {
      key: "genre",
      type: IndexType.String,
      sortedKeys: ["Action", "Comedy", "Drama"],
      value: {
        Action: [1, 2, 3],
        Comedy: [2, 4, 5],
        Drama: [4, 6, 7, 8],
      },
    };
    let indexResultsA: FilterResult = {
      key: "",
      matches: [1, 2, 3, 4],
      indexKey: "A",
    };
    let indexResultsB: FilterResult = {
      key: "",
      matches: [1, 2],
      indexKey: "B",
    };
    let genreIndexResults: FilterResult = {
      key: "",
      matches: [],
      indexKey: "genre",
    };
    it("Should return the index hash if no other index results were included", () => {
      let refinerOptions = finders.getRefinerOptions(genresIndex, []);
      // console.log(refinerOptions);
      expect(refinerOptions).toHaveLength(3);
      expect(refinerOptions.find((r) => r.key === "Action").count).toBe(3);
    });

    it("Should account for other Index Filter results", () => {
      let refinerOptions = finders.getRefinerOptions(genresIndex, [
        indexResultsA,
        indexResultsB,
        genreIndexResults,
      ]);
      expect(refinerOptions).toHaveLength(2);
      expect(refinerOptions.find((r) => r.key === "Action").count).toBe(2);
      expect(refinerOptions.find((r) => r.key === "Comedy").count).toBe(1);
    });

    it("Should return no options if another indexResult had zero matches", () => {
      let indexResultsC: FilterResult = {
        key: "",
        matches: [],
        indexKey: "C",
      };
      let refinerOptions = finders.getRefinerOptions(genresIndex, [indexResultsC]);
      // console.log(refinerOptions);
      expect(refinerOptions).toHaveLength(0);
    });
  });
});

describe("getRefinerOptions", () => {
  // TODO: Add tests for this
});
