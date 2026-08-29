import type { SearchQuery } from "../SearchTypes";

export function buildAutomataSearchUrl(
  query: SearchQuery,
  page:number
) {
  console.log(page)
  const params = new URLSearchParams();

  if (query.text) {
    params.set("text", query.text);
  }
  for (const tag of query.tags) {
    params.append("tags", tag.id);
  }

  for (const collection of query.collections) {
    params.append("collections", collection.id);
  }

  if (query.owner) {
    params.set("owner", query.owner);
  }

  if (query.sort) {
    params.set("sort", query.sort);
  }
  params.set("page", page.toString());

  return `/search_by_tags/?${params.toString()}`;
}