import { IndexFilter } from "../interfaces";
import { parseFilter } from "../helpers/filterParser";

export {};

describe("Filter Parser", () => {
  it("Should support a single string", () => {
    let filter = { genre: "Action" };
    let expected: IndexFilter[] = [{ indexKey: "genre", values: ["Action"] }];

    let filters = parseFilter(filter);
    expect(JSON.stringify(filters)).toBe(JSON.stringify(expected));
  });

  it("Should support a string array", () => {
    let filter = { genre: ["Action", "Comedy"] };
    let expected: IndexFilter[] = [{ indexKey: "genre", values: ["Action", "Comedy"] }];

    let filters = parseFilter(filter);
    expect(JSON.stringify(filters)).toBe(JSON.stringify(expected));
  });

  it("Should support a single number", () => {
    let filter = { score: 7.1 };
    let expected: IndexFilter[] = [{ indexKey: "score", values: [7.1] }];

    let filters = parseFilter(filter);
    expect(JSON.stringify(filters)).toBe(JSON.stringify(expected));
  });
  it("Should support a number array", () => {
    let filter = { score: [7.2, 7.1] };
    let expected: IndexFilter[] = [{ indexKey: "score", values: [7.2, 7.1] }];

    let filters = parseFilter(filter);
    expect(JSON.stringify(filters)).toBe(JSON.stringify(expected));
  });

  it("Should support multiple string filters", () => {
    let filter = { genre: ["Action", "Comedy"], title: "300" };
    let expected: IndexFilter[] = [
      { indexKey: "genre", values: ["Action", "Comedy"] },
      { indexKey: "title", values: ["300"] },
    ];

    let filters = parseFilter(filter);
    expect(JSON.stringify(filters)).toBe(JSON.stringify(expected));
  });

  it("Should support min and max range", () => {
    let filter = { score: { min: 5, max: 8 } };
    let expected: IndexFilter[] = [{ indexKey: "score", min: 5, max: 8 }];

    let filters = parseFilter(filter);
    expect(JSON.stringify(filters)).toBe(JSON.stringify(expected));
  });
  it("Should support just a min", () => {
    let filter = { score: { min: 5 } };
    let expected: IndexFilter[] = [{ indexKey: "score", min: 5 }];

    let filters = parseFilter(filter);
    expect(JSON.stringify(filters)).toBe(JSON.stringify(expected));
  });
  it("Should support just a max", () => {
    let filter = { score: { max: 8 } };
    let expected: IndexFilter[] = [{ indexKey: "score", max: 8 }];

    let filters = parseFilter(filter);
    expect(JSON.stringify(filters)).toBe(JSON.stringify(expected));
  });

  it("Should support multiple with multiple types", () => {
    let filter = { score: { min: 5 }, genre: ["Action", "Drama"], title: "Day*" };
    let expected: IndexFilter[] = [
      { indexKey: "score", min: 5 },
      { indexKey: "genre", values: ["Action", "Drama"] },
      { indexKey: "title", values: ["Day*"] },
    ];

    let filters = parseFilter(filter);
    expect(JSON.stringify(filters)).toBe(JSON.stringify(expected));
  });

  it("Should handle a null filter", () => {
    let expected = [];
    let filters = parseFilter(null);
    expect(JSON.stringify(filters)).toBe(JSON.stringify(expected));
  });

  it("Should handle an undefined filter", () => {
    let criteria: any = {};
    let expected = [];
    let filters = parseFilter(criteria.filter);
    expect(JSON.stringify(filters)).toBe(JSON.stringify(expected));
  });
});
