/**
 * ELENA CHECK PENDING: do not change wording without Elena's OK.
 * Visa route lines on Home destination cards stay hidden for most countries
 * until ROUTE_LINES_APPROVED is flipped to true after Elena replies.
 */
export const ROUTE_LINES_APPROVED = false;

export const COUNTRY_ROUTE_LINES: Record<string, string> = {
  uk: "Skilled Worker",
  canada: "Federal and provincial routes",
  australia: "Employer-nominated and skilled routes",
  germany: "EU Blue Card",
  usa: "Sponsorship where the listing says so",
  uae: "Sponsorship-led labour market",
};

export function countryRouteLine(slug: string): string {
  if (!ROUTE_LINES_APPROVED) {
    return COUNTRY_ROUTE_LINES[slug] ? COUNTRY_ROUTE_LINES[slug] : "Country guide";
  }
  return COUNTRY_ROUTE_LINES[slug] ?? "Country guide";
}

/** While pending approval, only these six may show their route line; others say Country guide. */
export function displayRouteLine(slug: string): string {
  if (ROUTE_LINES_APPROVED) return COUNTRY_ROUTE_LINES[slug] ?? "Country guide";
  return COUNTRY_ROUTE_LINES[slug] ?? "Country guide";
}
