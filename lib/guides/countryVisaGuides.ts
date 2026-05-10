/**
 * Copied from global_sponsor_hub-fe/src/data/countryVisaGuides.ts — keep in sync when country guides change on web.
 */
export type CountryVisaGuidePartnerLink = {
  label: string;
  href: string;
  hint?: string;
};

export type CountryVisaGuideSection = {
  heading: string;
  paragraphs: string[];
};

export type CountryVisaGuide = {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  countryLabel: string;
  updatedISO: string;
  sections: CountryVisaGuideSection[];
  partnerLinks: CountryVisaGuidePartnerLink[];
};

export const COUNTRY_VISA_GUIDES: CountryVisaGuide[] = [
  {
    slug: "uk-skilled-worker-and-sponsored-jobs",
    title: "UK Skilled Worker sponsorship and practical job-search steps",
    countryLabel: "United Kingdom",
    excerpt:
      "What to check before applying for UK sponsor-backed roles, and where relocation or legal support may help.",
    metaDescription:
      "UK Skilled Worker route for international hires: sponsor signals, interview diligence, and vetted immigration partners on Global Sponsor Hub.",
    updatedISO: "2026-05-01",
    sections: [
      {
        heading: "Start from labelled sponsorship signals",
        paragraphs: [
          "On Global Sponsor Hub, employers can label roles with mobility support such as visa sponsorship. Use those labels as your first filter, then read the full listing details.",
          "Always verify your own eligibility (for example role type, salary thresholds, and language requirements). Labels show employer intent; only official rules decide outcomes.",
        ],
      },
      {
        heading: "Common patterns in UK sponsor-backed hiring",
        paragraphs: [
          "Healthcare and technology often have active sponsorship demand, but availability changes by employer and season. Combine skills keywords with location and benefit filters.",
          "When timelines matter, ask early about sponsor licence status and Certificate of Sponsorship timing so you can plan notice periods and travel realistically.",
        ],
      },
      {
        heading: "When to use specialist support",
        paragraphs: [
          "If your case is complex, you may need regulated immigration or relocation support alongside your job applications.",
          "Use the partner directory to compare providers by service type. Keep decisions evidence-based and confirm legal advice credentials before engaging anyone.",
        ],
      },
    ],
    partnerLinks: [
      {
        label: "Browse immigration & relocation partners",
        href: "/partners/directory",
        hint: "Filter by category once you know which specialist you need.",
      },
      {
        label: "Search employer-posted UK roles",
        href: "/jobs?location=United%20Kingdom",
      },
    ],
  },
  {
    slug: "ireland-employment-permits-job-search",
    title: "Ireland: employment permits, Critical Skills, and sponsor-backed hiring",
    countryLabel: "Ireland",
    excerpt:
      "Permit families employers lean on, signals that belong in job posts, and how to combine relocation logistics with partner support.",
    metaDescription:
      "Ireland employment permits explained for mobile candidates: Critical Skills vs General permits, hiring signals, and Global Sponsor Hub partner referrals.",
    updatedISO: "2026-05-01",
    sections: [
      {
        heading: "Know which permit story matches the posting",
        paragraphs: [
          "Irish employers usually cite Critical Skills or General Employment Permit tracks when they genuinely relocate talent. Ask early which permit pathway applies — payroll location inside Ireland usually confirms residency intent.",
          "Some firms are newer to international hiring. Asking clear diligence questions early can prevent delays and rework later.",
        ],
      },
      {
        heading: "Relocation realism",
        paragraphs: [
          "Dublin housing velocity rivals London — negotiate realistic start dates and clarify relocation allowances versus gross salary uplift.",
          "Partners specialising in Irish arrivals help sequence GNIB appointments, PPSN issuance, and banking prerequisites.",
        ],
      },
      {
        heading: "Use guidance and support together",
        paragraphs: [
          "Read practical guides first, then open partner profiles only if you need help with legal, tax, or relocation execution.",
          "This keeps your search focused: understand the process, then choose support where it genuinely reduces risk.",
        ],
      },
    ],
    partnerLinks: [
      { label: "Partner directory — Ireland-ready advisors", href: "/partners/directory" },
      { label: "Jobs mentioning relocation / sponsorship filters", href: "/jobs?benefit=Relocation%20Support" },
    ],
  },
  {
    slug: "germany-eu-blue-card-jobseekers",
    title: "Germany: EU Blue Card basics and practical interview preparation",
    countryLabel: "Germany",
    excerpt:
      "Salary thresholds, recognition of qualifications, and sponsor-backed versus offer-first routes — framed for candidates comparing Berlin/Munich hubs.",
    metaDescription:
      "Germany EU Blue Card basics for sponsored job seekers: credential recognition, salary benchmarks, and relocation partner coordination via Global Sponsor Hub.",
    updatedISO: "2026-05-01",
    sections: [
      {
        heading: "Separate visa mechanics from employer economics",
        paragraphs: [
          "German employers regularly bundle relocation vendors once an offer is signed — clarify whether visa filing support sits in-house or requires external counsel.",
          "Blue Card thresholds adjust periodically; verify against official bulletins at signing, not only job-post footnotes.",
        ],
      },
      {
        heading: "Partner-ready credential workflows",
        paragraphs: [
          "Engineers often need ANABIN / ZAB equivalency reviews — immigration partners in our directory frequently coordinate parallel credential + visa filings.",
          "Escalate to specialist support only when needed, especially for regulated roles where credential recognition can add extra steps.",
        ],
      },
      {
        heading: "Useful next pages",
        paragraphs: [
          "After this guide, use jobs filters and the partner directory for practical next actions.",
          "This helps you move from research to applications without losing context.",
        ],
      },
    ],
    partnerLinks: [
      { label: "Find Germany-focused mobility partners", href: "/partners/directory" },
      { label: "Germany-filtered job search", href: "/jobs?location=Germany" },
    ],
  },
];

export function getCountryVisaGuide(slug: string): CountryVisaGuide | undefined {
  return COUNTRY_VISA_GUIDES.find((g) => g.slug === slug);
}

export function listCountryVisaGuideSummaries(): Pick<
  CountryVisaGuide,
  "slug" | "title" | "excerpt" | "countryLabel"
>[] {
  return COUNTRY_VISA_GUIDES.map(({ slug, title, excerpt, countryLabel }) => ({
    slug,
    title,
    excerpt,
    countryLabel,
  }));
}
