/** Compare-countries destinations — aligned with marketing country hubs. */
export type CompareCountryDestination = {
  slug: string;
  label: string;
  jobsLocation: string;
  guideSlug?: string;
};

export const COMPARE_COUNTRY_DESTINATIONS: CompareCountryDestination[] = [
  { slug: "uk", label: "United Kingdom", jobsLocation: "United Kingdom", guideSlug: "uk-skilled-worker-and-sponsored-jobs" },
  { slug: "canada", label: "Canada", jobsLocation: "Canada", guideSlug: "canada-work-permit-jobs" },
  { slug: "australia", label: "Australia", jobsLocation: "Australia", guideSlug: "australia-skilled-visa-jobs" },
  { slug: "usa", label: "United States", jobsLocation: "United States", guideSlug: "usa-work-visa-jobs" },
  { slug: "germany", label: "Germany", jobsLocation: "Germany", guideSlug: "germany-eu-blue-card-jobseekers" },
  { slug: "uae", label: "UAE", jobsLocation: "UAE", guideSlug: "uae-work-visa-jobs" },
  { slug: "ireland", label: "Ireland", jobsLocation: "Ireland", guideSlug: "ireland-employment-permits-job-search" },
  { slug: "singapore", label: "Singapore", jobsLocation: "Singapore", guideSlug: "singapore-employment-pass-jobs" },
  { slug: "new-zealand", label: "New Zealand", jobsLocation: "New Zealand", guideSlug: "new-zealand-accredited-employer-jobs" },
  { slug: "netherlands", label: "Netherlands", jobsLocation: "Netherlands", guideSlug: "netherlands-highly-skilled-migrant-jobs" },
  { slug: "switzerland", label: "Switzerland", jobsLocation: "Switzerland" },
];
