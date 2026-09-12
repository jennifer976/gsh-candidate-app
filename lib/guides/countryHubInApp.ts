/**
 * Maps website-style `/jobs/country/:segment` paths to in-app navigation.
 * Segments without a full guide open Jobs (candidate can filter by location).
 */
export type JobsCountryHubResolution =
  | { kind: "appGuide"; slug: string }
  | { kind: "discover" };

export function resolveJobsCountryHubPath(
  pathname: string,
): JobsCountryHubResolution | null {
  const raw = pathname.trim().split("#")[0] ?? "";
  const path = raw.split("?")[0] ?? raw;
  const m = /^\/jobs\/country\/([^/]+)$/i.exec(path);
  if (!m) return null;
  const seg = m[1].toLowerCase();
  const guides: Record<string, string> = {
    uk: "uk-skilled-worker-and-sponsored-jobs",
    "united-kingdom": "uk-skilled-worker-and-sponsored-jobs",
    ireland: "ireland-employment-permits-job-search",
    germany: "germany-eu-blue-card-jobseekers",
    canada: "canada-work-permit-jobs",
    australia: "australia-skilled-visa-jobs",
    usa: "usa-work-visa-jobs",
    "united-states": "usa-work-visa-jobs",
    uae: "uae-work-visa-jobs",
    "united-arab-emirates": "uae-work-visa-jobs",
    singapore: "singapore-employment-pass-jobs",
    netherlands: "netherlands-highly-skilled-migrant-jobs",
    "new-zealand": "new-zealand-accredited-employer-jobs",
  };
  if (guides[seg]) return { kind: "appGuide", slug: guides[seg] };
  return { kind: "discover" };
}
