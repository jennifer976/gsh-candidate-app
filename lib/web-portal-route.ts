/** Canonical site paths opened inside `web-portal` (marketing www). */
export const WEB_PORTAL = {
  visaWizard: "/tools/visa-wizard",
  curatedJobs: "/jobs/external",
  guides: "/guides",
  candidateTools: "/candidate/tools",
} as const;

export function webPortalRoute(path: string, title: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return {
    pathname: "/web-portal" as const,
    params: { path: encodeURIComponent(p), title },
  };
}
