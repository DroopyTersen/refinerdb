import { IndexConfig, IndexType } from "refinerdb";

const fetchPosts = async (tag = "javascript", per_page = 500, page = 1) => {
  let url = `https://dev.to/api/articles?state=rising&page=${page}&per_page=${per_page}&tag=${tag}`;
  return fetch(url).then((resp) => resp.json());
};

export const formatDateForRefinement = (dateish) => {
  var d = new Date(dateish),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [month, day, year].join("/");
};

export async function getDevToArticles(tag = "javascript") {
  let pagedResults = await Promise.all([
    fetchPosts(tag, 500, 1),
    fetchPosts(tag, 500, 2),
    fetchPosts(tag, 500, 3),
  ]);
  let rawArticles = pagedResults.flat();

  let articles = rawArticles.map((raw) => ({
    id: raw.id,
    title: raw.title,
    description: raw.description,
    url: raw.url,
    reactions_count: raw.public_reactions_count,
    comments_count: raw.comments_count,
    published_timestamp: raw.published_timestamp,
    published_date: formatDateForRefinement(raw.published_timestamp),
    image: raw.cover_image,
    tag_list: raw.tag_list,
    user: raw.user,
  }));
  return articles;
}

export const devToIndexes: IndexConfig[] = [
  { key: "title", type: IndexType.String, skipRefinerOptions: true, label: "Title" },
  { key: "description", type: IndexType.String, skipRefinerOptions: true, label: "Description" },
  {
    key: "tag_list",
    type: IndexType.String,
    label: "Tags",
  },
  {
    key: "author",
    type: IndexType.String,
    path: "user.username",
    skipRefinerOptions: true,
    label: "Author",
  },
  {
    key: "published_date",
    type: IndexType.String,
    skipRefinerOptions: false,
  },
  {
    key: "reactions_count",
    type: IndexType.Number,
    skipRefinerOptions: true,
    label: "Num Reactions",
  },
  {
    key: "comments_count",
    type: IndexType.Number,
    skipRefinerOptions: true,
    label: "Num Comments",
  },
  {
    key: "published_timestamp",
    type: IndexType.Date,
    skipRefinerOptions: true,
    label: "Published",
  },
];
