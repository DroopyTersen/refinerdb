import moviesData from "./fixtures/movies";
import tvShowData from "./fixtures/tvShows";
import omit from "just-omit";

export const getMoviesAndTv = async () => {
  let movies = moviesData.map((item: any) => {
    item.released = new Date(item.released + " GMT-5000");
    item.type = "Movie";
    return item;
  });
  let tvShows = tvShowData.map((item: any) => {
    item.released = new Date(item.released + " GMT-5000");
    item.type = "TV Show";
    return item;
  });
  let allItems = [...movies, ...tvShows];
  return allItems;
};
