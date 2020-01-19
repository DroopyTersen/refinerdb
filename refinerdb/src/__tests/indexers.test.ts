import { IndexType, SearchIndex } from "../interfaces";
import { indexValues, indexers } from "../helpers/indexers";

describe.only("search.indexers", () => {
  describe("indexValue", () => {
    let stringIndex: SearchIndex = {
      key: "genres",
      type: IndexType.String,
    };
    let stringHashes1 = ["comedy", "drama", "action"];
    let stringHashes2 = ["comedy", "drama", "horror"];
    beforeAll(() => {
      indexValues(stringHashes1, 1, stringIndex);
      indexValues(stringHashes2, 2, stringIndex);
    });
    it("Should loop through hash values and create an object with a property for each hash value", () => {
      expect(Object.keys(stringIndex.value)).toHaveLength(4);
      expect(stringIndex.value).toHaveProperty("drama");
      expect(stringIndex.value.drama).toHaveLength(2);
    });
    it("Should setup non-duplicate sortedKeys, but they won't be sorted yet (only sort at the end)", () => {
      expect(stringIndex.sortedKeys).toHaveLength(4);
    });
  });

  describe("indexers.indexString", () => {
    let genreIndex: SearchIndex = {
      key: "genre",
      path: "genres",
      type: IndexType.String,
    };
    let titleIndex: SearchIndex = {
      key: "title",
      type: IndexType.String,
    };

    let items = [
      { title: "Kindergarden Cop", genres: ["comedy", "drama", "action"] },
      { title: "A Lot Like Love", genres: ["comedy", "romance"] },
    ];

    it("Should support a hashFn that retuns a single string", () => {
      indexers[IndexType.String](items[0], 0, titleIndex);
      indexers[IndexType.String](items[1], 1, titleIndex);
      expect(Object.keys(titleIndex.value)).toHaveLength(2);
      expect(titleIndex.value).toHaveProperty(items[0].title);
      expect(titleIndex.value[items[0].title]).toHaveLength(1);
    });
    it("Should support a hashFn that returns a string array", () => {
      indexers[IndexType.String](items[0], 0, genreIndex);
      indexers[IndexType.String](items[1], 1, genreIndex);
      expect(Object.keys(genreIndex.value)).toHaveLength(4);
      expect(genreIndex.value).toHaveProperty("comedy");
      expect(genreIndex.value).toHaveProperty("romance");
      expect(genreIndex.value).toHaveProperty("action");
      expect(genreIndex.value.comedy).toHaveLength(2);
      expect(genreIndex.value.romance).toHaveLength(1);
      expect(genreIndex.value.action).toHaveLength(1);
    });
  });

  describe("indexers.indexDate", () => {
    let items = [
      { name: "Andrew", born: new Date("9/12/1987") },
      { name: "Hannah", born: new Date("3/23/1992") },
      { name: "Mom", born: "4/7/1962" },
      { name: "Dad", born: "12/22/1955" },
    ];

    it("Should support a hashFn that returns a single Date or DateString", () => {
      let bornIndex: SearchIndex = {
        key: "bornOnDate",
        path: "born",
        type: IndexType.Date,
      };

      indexers[IndexType.Date](items[0], 0, bornIndex);
      indexers[IndexType.Date](items[1], 1, bornIndex);
      indexers[IndexType.Date](items[2], 2, bornIndex);
      indexers[IndexType.Date](items[3], 3, bornIndex);

      expect(Object.keys(bornIndex.value)).toHaveLength(4);
      expect(bornIndex.value["1987-09-12T05:00:00.000Z"]).toHaveLength(1);
    });

    it("Should properly handle invalid dates", () => {
      // TODO: what should it do?
      let bornIndex: SearchIndex = {
        key: "bornOnDate",
        path: "born",
        type: IndexType.Date,
      };
      let items = [
        { name: "Andrew", born: "blah" },
        { name: "Hannah", born: new Date("3/23/1992") },
      ];
      indexers[IndexType.Date](items[0], 0, bornIndex);
      indexers[IndexType.Date](items[1], 1, bornIndex);
      expect(Object.keys(bornIndex.value)).toHaveLength(1);
    });
  });

  describe("indexers.indexNumber", () => {
    let items = [
      { name: "Andrew", age: 32 },
      { name: "Hannah", age: 27 },
      { name: "Mom", age: 58 },
      { name: "Dad", age: 64 },
    ];

    it("Should support a hashFn that returns a single Number", () => {
      let ageIndex: SearchIndex = {
        key: "age",
        type: IndexType.Number,
      };

      indexers[IndexType.Number](items[0], 0, ageIndex);
      indexers[IndexType.Number](items[1], 1, ageIndex);
      indexers[IndexType.Number](items[2], 2, ageIndex);
      indexers[IndexType.Number](items[3], 3, ageIndex);

      expect(Object.keys(ageIndex.value)).toHaveLength(4);
      expect(ageIndex.value["32"]).toHaveLength(1);
      expect(ageIndex.value["27"]).toHaveLength(1);
      expect(ageIndex.value["58"]).toHaveLength(1);
      expect(ageIndex.value["64"]).toHaveLength(1);
    });
    it("Should properly handle undefined", () => {
      // TODO: what should it do?
      let ageIndex: SearchIndex = {
        key: "age",
        path: "invalid!",
        type: IndexType.Number,
      };
      let items = [{ name: "Andrew", age: "blah" }];
      indexers[IndexType.Number](items[0], 0, ageIndex);
      // console.log(ageIndex);
      expect(Object.keys(ageIndex.value)).toHaveLength(0);
    });

    it("Should properly handle invalid numbers", () => {
      // TODO: what should it do?
      let ageIndex: SearchIndex = {
        key: "age",
        type: IndexType.Number,
      };
      let items = [{ name: "Andrew", age: "blah" }];
      indexers[IndexType.Number](items[0], 0, ageIndex);
      // console.log(ageIndex);
      expect(Object.keys(ageIndex.value)).toHaveLength(0);
    });
  });
});
