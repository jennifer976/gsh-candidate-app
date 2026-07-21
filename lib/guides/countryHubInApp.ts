/**
 * Maps website-style `/jobs/country/:segment` paths to in-app navigation.
 * Segments without a full guide open Jobs (candidate can filter by location).
 */
export type JobsCountryHubResolution =
  | { kind: "appGuide"; slug: string }
  | { kind: "discover" };

export function resolveJobsCountryHubPath(pathname: string): JobsCountryHubResolution | null {
  const raw = pathname.trim().split("#")[0] ?? "";
  const path = raw.split("?")[0] ?? raw;
  const m = /^\/jobs\/country\/([^/]+)$/i.exec(path);
  if (!m) return null;
  const seg = m[1].toLowerCase();
  if (seg === "ireland") return { kind: "appGuide", slug: "ireland-employment-permits-job-search" };
  if (seg === "germany") return { kind: "appGuide", slug: "germany-eu-blue-card-jobseekers" };
  if (seg === "uk" || seg === "united-kingdom") return { kind: "appGuide", slug: "uk-skilled-worker-and-sponsored-jobs" };
  return { kind: "discover" };
}
