import movies from "../fixtures/movies";
import RefinerDB from "../..";
import { IndexConfig, IndexType, QueryResult } from "../../interfaces";
import { resetMockStorage, setupMockStorageApis, teardownMockStorageApis } from "../storageMocks";

let items = movies.map((item: any) => {
  item.released = new Date(item.released + " GMT-5000");
  // TODO: add boolean support and tack on a randomize a watched boolean
  return item;
});

let actionMovies = items.filter((m) => m.genres.indexOf("Action") > -1).map((m) => m.title);
let comedies = items.filter((m) => m.genres.indexOf("Comedy") > -1).map((m) => m.title);

let nightMovies = items.filter((m) => m.title.toLowerCase().indexOf("night") > -1);
let actionNightMovies = nightMovies
  .filter((m) => m.genres.indexOf("Action") > -1)
  .map((m) => m.title);
// Genre: Action - 329
// Genre: Comedy - 239
// Title: Halloween - 3
let indexes: IndexConfig[] = [
  { key: "title", type: IndexType.String },
  { key: "genre", path: "genres", type: IndexType.String },
  { key: "released", type: IndexType.Date },
  { key: "score", type: IndexType.Number, skipRefinerOptions: true },
];

describe("Query Tests - Movies Data Set", () => {
  let search: RefinerDB;

  beforeAll(async () => {
    setupMockStorageApis();
    resetMockStorage();
    search = new RefinerDB("movies", { indexDelay: 100 });
    search.setIndexes(indexes);
    await search.setItems(items);
  });

  describe("Query for Action Movies", () => {
    let result: QueryResult = null;
    beforeAll(async () => {
      result = await search.query({ filter: { genre: "Action" } });
      return;
    });
    it("Should return only movies with Action in the genres array", () => {
      expect(result).toBeTruthy();
      expect(result.items).toHaveLength(actionMovies.length);
      result.items.forEach((item) => {
        expect(item.genres.indexOf("Action")).toBeGreaterThan(-1);
      });
    });
    it("Should return refiners for 'genre' that include all movies", () => {
      expect(result).toHaveProperty("refiners");
      expect(result.refiners).toHaveProperty("genre");
      let comedyRefinerOption = result.refiners.genre.find((r) => r.key === "Comedy");
      expect(comedyRefinerOption).toBeTruthy();
      expect(comedyRefinerOption.count).toBe(comedies.length);
    });
  });

  describe("Query for movies with 'night' in the title", () => {
    let result: QueryResult = null;
    beforeAll(async () => {
      result = await search.query({ filter: { title: "night*" } });
      return;
    });
    it("Should only bring back movies with night in the title", () => {
      expect(result).toBeTruthy();
      expect(result.items).toHaveLength(nightMovies.length);
    });

    it("Should bring back genre refiners whose counts are filtered by the title filter", () => {
      expect(result).toHaveProperty("refiners");
      expect(result.refiners).toHaveProperty("genre");
      let actionRefinerOption = result.refiners.genre.find((r) => r.key === "Action");
      expect(actionRefinerOption).toBeTruthy();
      expect(actionRefinerOption.count).toBe(actionNightMovies.length);
    });
  });

  describe("Query for well scored Action movies", () => {
    let result: QueryResult = null;
    beforeAll(async () => {
      result = await search.query({
        filter: { genre: "Action", score: { min: 7 } },
        sort: "score",
        sortDir: "desc",
      });
    });
    it("Should only include action movies with a score >= 7", () => {
      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach((movie) => {
        expect(movie).toHaveProperty("id");
        expect(movie.genres.indexOf("Action")).toBeGreaterThan(-1);
        expect(movie.score).toBeGreaterThanOrEqual(7);
      });
    });
    it("Should have genre refiner counts that only account for movies with a score >= 7", async () => {
      expect(result).toHaveProperty("refiners");
      expect(result.refiners).toHaveProperty("genre");
      let comedyRefinerOption = result.refiners.genre.find((r) => r.key === "Comedy");
      expect(comedyRefinerOption).toBeTruthy();
      let comedyCount = comedyRefinerOption.count;
      let comedyResults = await search.query({ filter: { genre: "Comedy", score: { min: 7 } } });
      expect(comedyResults).toBeTruthy();
      expect(comedyResults.items).toHaveLength(comedyCount);
      comedyResults.items.forEach((movie) => {
        expect(movie.genres.indexOf("Comedy")).toBeGreaterThan(-1);
        expect(movie.score).toBeGreaterThanOrEqual(7);
      });
    });
  });

  afterAll(() => {
    teardownMockStorageApis();
  });
});
