export type PublicExternalJobFilters = {
  sourceType?: string;
  q?: string;
  location?: string;
  benefit?: string;
  workMode?: string;
  page?: number;
  perPage?: number;
  sourceRelationship?:
    | "curated_external"
    | "employer_connected"
    | "employer_posted";
};

/** Keep structured filters distinct from free-text search and display labels. */
export function externalJobQuery(
  filters: PublicExternalJobFilters = {},
): string {
  const query = new URLSearchParams();
  for (const key of ["sourceType", "q", "location", "benefit", "workMode"] as const) {
    const value = filters[key]?.trim();
    if (value) query.set(key, value);
  }
  if (filters.page != null) query.set("page", String(filters.page));
  if (filters.perPage != null) query.set("perPage", String(filters.perPage));
  if (filters.sourceRelationship)
    query.set("sourceRelationship", filters.sourceRelationship);
  return query.toString();
}
