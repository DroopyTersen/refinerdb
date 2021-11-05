import binarySearch, { findStringRange, compareNumbers } from "../../helpers/binarySearch";

let sortedNumberArray = [-1, 0, 1.1, 3, 3.2, 4, 10];
let sortedStringArray = [
  "2010",
  "2011",
  "2012",
  "2013",
  "2014",
  "2015",
  "2016",
  "2017",
  "2018",
  "2019",
  "2020",
];
describe("Binary Search", () => {
  describe("binarySearch", () => {
    it("Should return the index of an exact match.", () => {
      let index = binarySearch(sortedNumberArray, 1.1, compareNumbers);
      expect(index).toBe(2);
    });
    it("Should return a negative number if an exact match is not found and round is not specified", () => {
      let index = binarySearch(sortedNumberArray, 1, compareNumbers);
      expect(index).toBeLessThan(0);
    });
    it("Should return the closest index less than target with round 'down'", () => {
      let index = binarySearch(sortedNumberArray, 1, compareNumbers, "down");
      expect(index).toBe(1);
    });
    it("Should return the closest index above than target with round 'up'", () => {
      let index = binarySearch(sortedNumberArray, 1, compareNumbers, "up");
      expect(index).toBe(2);
    });
  });

  describe("findStringRange", () => {
    it("Should return an array of strings inside or equal to the given min/max", () => {
      let result = findStringRange(sortedStringArray, "2016", "2019");
      expect(result).toHaveLength(4);
      expect(result[0]).toBe("2016");
      expect(result[3]).toBe("2019");
    });
    it("Should allow passing just a min", () => {
      let result = findStringRange(sortedStringArray, "2016");
      expect(result).toHaveLength(5);
      expect(result[0]).toBe("2016");
      expect(result[4]).toBe("2020");
    });
    it("Should allow passing just a max", () => {
      let result = findStringRange(sortedStringArray, "", "2013");
      expect(result).toHaveLength(4);
      expect(result[3]).toBe("2013");
    });
    it("Should support a min/max that exceeds value range", () => {
      let result = findStringRange(sortedStringArray, "2007", "2025");
      expect(result).toHaveLength(sortedStringArray.length);
    });
    it("Should support passing a max that is less than the smallest value", () => {
      let result = findStringRange(sortedStringArray, "2015", "2000");
      expect(result).toHaveLength(0);
    });
  });
});
