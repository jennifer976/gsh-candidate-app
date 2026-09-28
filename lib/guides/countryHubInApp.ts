/**
 * Maps website-style `/jobs/country/:segment` paths to the app's country pages.
 * Unknown segments open Jobs, where the candidate can filter by location.
 */
export type JobsCountryHubResolution =
  | { kind: "country"; slug: string }
  | { kind: "discover" };

const COUNTRY_HUB_SEGMENTS: Record<string, string> = {
  uk: "uk",
  "united-kingdom": "uk",
  ireland: "ireland",
  germany: "germany",
  canada: "canada",
  australia: "australia",
  usa: "usa",
  "united-states": "usa",
  uae: "uae",
  "united-arab-emirates": "uae",
  singapore: "singapore",
  netherlands: "netherlands",
  "new-zealand": "new-zealand",
  switzerland: "switzerland",
};

export function resolveJobsCountryHubPath(
  pathname: string,
): JobsCountryHubResolution | null {
  const raw = pathname.trim().split("#")[0] ?? "";
  const path = raw.split("?")[0] ?? raw;
  const m = /^\/jobs\/country\/([^/]+)$/i.exec(path);
  if (!m) return null;
  const slug = COUNTRY_HUB_SEGMENTS[m[1].toLowerCase()];
  return slug ? { kind: "country", slug } : { kind: "discover" };
}
