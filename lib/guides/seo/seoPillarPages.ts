import type {
  SeoPillarAppendixTable,
  SeoPillarPageConfig,
  SeoPillarRelatedLink,
} from "./seoPillarTypes";

/** Primary job-list CTAs share the same `/jobs` base with benefit filters where applicable */
const JOBS_SPONSOR = "/jobs?benefit=Visa Sponsorship";
const JOBS_RELOC = "/jobs?benefit=Relocation Support";

const partners = "/partners/directory";
const forEmployers = "/employers";
const home = "/";

function related(...links: SeoPillarRelatedLink[]): SeoPillarRelatedLink[] {
  return links;
}

const STANDARD_LAST_REVIEWED = "2026-04-30";

/** In-app country guides + Discover for other destinations (replaces long `/jobs/country/*` web link rows). */
const IN_APP_CORRIDOR_BLURB =
  "**In this app:** [Ireland](/guides/country/ireland-employment-permits-job-search) · [Germany](/guides/country/germany-eu-blue-card-jobseekers) · [United Kingdom](/guides/country/uk-skilled-worker-and-sponsored-jobs). For Canada, the US, Australia, and elsewhere, open **Discover** and filter by location.";

/** Country comparison appendix for the international pillar */
const INTERNATIONAL_COMPARISON: SeoPillarAppendixTable = {
  heading: "Rough country comparison (illustrative — always verify with official immigration sites)",
  columns: [
    "Country",
    "What you’ll often see employers discuss (simplified)",
    "Possible longer-term stay routes (high level; individual outcomes vary)",
  ],
  rows: [
    [
      "Canada",
      "Positive LMIA in many cases; job offer; employer proves role cannot be filled locally.",
      "Work permits can lead to permanent residence via Express Entry.",
    ],
    [
      "Australia",
      "Approved sponsor; nominate a skilled occupation; candidate skills + English.",
      "TSS subclass 482 can lead to permanent residence after ~2 years in many cases.",
    ],
    [
      "United States",
      "H-1B for specialty occupations needing a bachelor’s equivalent; prevailing wage.",
      "Possible employer-sponsored route toward permanent residency (individual outcomes vary).",
    ],
    [
      "Germany",
      "EU Blue Card: job aligns with qualifications; ≥ 6-month contract; salary thresholds.",
      "Settlement possible after 33 months (or 21 with language per current rules—verify).",
    ],
    [
      "UAE",
      "Work permit via MOHRE + contract; convert entry visa to residence within a limited window.",
      "Residence visas (Green/Golden where applicable) for longer stays—verify eligibility.",
    ],
    [
      "Singapore",
      "Employment Pass with salary/competency expectations; employers show fair hiring process.",
      "Permanent residency possible after sustained employment subject to ICA policy.",
    ],
    [
      "Ireland",
      "Critical Skills Employment Permit bypasses labour market test in qualifying roles.",
      "Stamp 4 path after tenure—verify with official guidance.",
    ],
    [
      "New Zealand",
      "Accredited employer offers; Straight-to-Residence / Work-to-Residence pathways for qualifying roles.",
      "Pathways toward residence for eligible hires—policy changes apply.",
    ],
    [
      "Netherlands",
      "Highly Skilled Migrant scheme with recognised sponsors; contract + wage floors.",
      "Settlement after statutory residence periods—confirm with IND.",
    ],
    [
      "Switzerland",
      "Non‑EU hiring is restrictive; quotas; proof no suitable Swiss/EU candidate.",
      "Long‑term permits (e.g., B categories) depend on canton/policy—confirm facts.",
    ],
  ],
};

export const VISA_SPONSORSHIP_JOBS: SeoPillarPageConfig = {
  path: "/visa-sponsorship-jobs",
  metaTitle: "Visa sponsorship jobs & work abroad search | Global Sponsor Hub",
  metaDescription:
    "Find visa sponsorship jobs and international roles—employer-posted listings, sponsorship badges, relocation filters, and country hubs so you can search global careers without guesswork.",
  h1: "Visa sponsorship jobs on Global Sponsor Hub",
  intro: `Whether you’re targeting **work abroad**, **global jobs**, or roles that explicitly advertise **visa sponsorship**, this page is **about the search experience**—filters, listings, applications, and labels—not a country-by-country visa encyclopaedia.\n\nIf you are deciding *where* in the world to move, start with our **international outlook** guide; if you need to *vet a company*, jump to the sponsor-employer primer.\n\nThink of this as the “how do I actually use the marketplace” layer for candidates.`,
  lastReviewed: STANDARD_LAST_REVIEWED,
  officialLinks: [
    { label: "IRCC — Immigration, Refugees and Citizenship Canada", href: "https://www.canada.ca/en/immigration-refugees-citizenship.html" },
    { label: "US Citizenship and Immigration Services (USCIS)", href: "https://www.uscis.gov/" },
    { label: "Australia — Department of Home Affairs", href: "https://immi.homeaffairs.gov.au/" },
  ],
  sections: [
    {
      h2: "Who should read this (and what it omits)",
      body: `**For** candidates who want to browse Global Sponsor Hub efficiently—filters, badges, applications—without drowning in hypothetical visa categories.\n\n**Not for** personalised legal eligibility; always confirm your facts with governments or counsel.\n\nWhen you anchor on a corridor, descend into its hub for timelines and jargon that match that country.`,
    },
    {
      h2: "Where country-specific explanations live here",
      body: `${IN_APP_CORRIDOR_BLURB}\n\nEach hub pre-scopes job search and layers editorial context; governments still adjudicate permits independently of anything posted on listings.`,
    },
    {
      h2: "What you should expect from a sponsorship-labelled listing here",
      body: `Employers post directly; we expose structured **benefit badges** (including Visa Sponsorship) so you’re not inferring intent from vague wording.\n\nA label indicates the employer’s advertised intent for that vacancy—it is **not** an approval from a government and not a promise you personally qualify.\n\nAlways read salary, location, contract type, and seniority in the body of the post; badges summarise, they don’t replace details.`,
    },
    {
      h2: "How to search without wasting applications",
      body: `Combine **Visa Sponsorship** with country/location filters—or open a **country hub** for long-form corridor framing plus a pre-scoped job view.\n\nWhen you need airfare, housing, schooling, or concierge help, intersect with **Relocation Support** so you’re not negotiating basics from scratch.\n\nKeep a personal tracker: date applied, recruiter, whether an offer is conditional on permits, and any written benefit summary you received.`,
    },
    {
      h2: "When something looks off",
      body: `Pressure to pay third parties, freemail-only contacts, or “guaranteed visa” language should trigger a pause—see our relocation **scam red-flag** guide.\n\nIf sponsorship claims and job text disagree, report the listing and move on; life is too short for mystery employers.\n\nEscalate borderline cases only after you attempt to verify through official career channels.`,
    },
    {
      h2: "Where to go next for deeper help",
      body: `**Verify offers** with our employer checklist before resigning.\n**Plan money & family** moves with the relocating checklists.\n**Compare countries** once you have realistic shortlists.\n\nPartners (lawyers, movers, tax advisers) live in our **directory**, not inside every job post.`,
    },
  ],
  faqs: [
    {
      question: "Do Visa Sponsorship badges mean I’m eligible?",
      answer:
        "No. They reflect what the employer advertises for the role. Governments assess your personal eligibility separately.",
    },
    {
      question: "Should I mention sponsorship in my first message?",
      answer:
        "Be transparent early, but lead with fit. Our CV & interview guides show how to phrase logistics without derailing screening.",
    },
    {
      question: "Does Global Sponsor Hub scrape other boards?",
      answer:
        "No—employer postings are posted here directly, which keeps signals fresher than bulk scrapes.",
    },
    {
      question: "How do I find visa sponsorship jobs abroad?",
      answer:
        "Turn on the Visa Sponsorship benefit filter, narrow by location or open a country hub for a pre-scoped job view. Pair that with the international corridors guide if you’re comparing multiple destinations.",
    },
    {
      question: "Are listings here only for tech or “global jobs” in one sector?",
      answer:
        "No—filter by industry and region. Employers across sectors post directly; badges describe what they advertise for each role, not a single template.",
    },
  ],
  browseHref: JOBS_SPONSOR,
  browseLabel: "Open jobs with visa sponsorship filter",
  breadcrumbs: [{ name: "Home", path: home }, { name: "Visa sponsorship jobs", path: "/visa-sponsorship-jobs" }],
  relatedGuides: related(
    { href: "/relocating/job-offers-scams-red-flags", label: "Recruitment scam red flags" },
    { href: "/relocating/verify-employer-visa-job-offers", label: "Offer verification checklist" },
    { href: "/international-jobs-visa-sponsorship", label: "International country comparison" },
  ),
};

export const GLOBAL_RELOCATION_DIRECTORY: SeoPillarPageConfig = {
  path: "/global-relocation-directory",
  metaTitle: "Global relocation directory for international moves | Global Sponsor Hub",
  metaDescription:
    "Find relocation and immigration support partners in one place. Filter by service and location, compare providers, and choose who to contact. This supports job search planning but does not replace legal advice.",
  h1: "Relocation and immigration support partners",
  intro: `Many people need more than a job offer: visa paperwork help, relocation planning, tax support, schooling advice, or moving services.\n\nUse this directory after you shortlist roles, or earlier if you need support to plan a move.\n\nGlobal Sponsor Hub is not a law firm. For legal decisions, confirm details with official authorities or regulated advisers.`,
  lastReviewed: STANDARD_LAST_REVIEWED,
  sections: [
    {
      h2: "Who this directory is for",
      body: `Candidates who need practical support for cross-border moves, and families managing schools, housing, healthcare, or dependent paperwork.\n\nIf employer support is limited, external specialists can fill gaps.\n\n${IN_APP_CORRIDOR_BLURB}`,
    },
    {
      h2: "What jobs include vs what partners can help with",
      body: `A listing may include relocation support, but that often covers only part of the move.\n\nPartners may help with immigration steps, moving logistics, school search, tax setup, or housing transition.\n\nAlways check provider credentials and service scope before signing any agreement.`,
    },
    {
      h2: "When to involve a partner",
      body: `Useful times include: when your offer is conditional, when you need pre-arrival planning, and during your first months after moving.\n\nUse relocating checklists to decide what to do yourself and what to outsource.`,
    },
    {
      h2: "How to use filters on Global Sponsor Hub",
      body: `Open **/partners/directory**, narrow by geography and service modality (visa, removal, schooling, coaching, accounting).\n\nCross-link partner shortlists back to postings tagged **Visa Sponsorship** or **Relocation Support** depending on employer funding vs self-funded services.`,
    },
    {
      h2: "How to check provider quality",
      body: `Confirm regulatory status and insurance where relevant (for example legal registration or mover coverage).\n\nIf you spot misleading claims, report them so we can review quickly.`,
    },
  ],
  faqs: [
    {
      question: "Does the partner directory replace employer relocation teams?",
      answer:
        "No—many employers outsource execution to specialists listed here while HR retains approvals and spend caps.",
    },
    {
      question: "Browse cost for candidates?",
      answer:
        "Browsing is free. If you hire a provider, the agreement is between you (or your employer) and that provider.",
    },
    {
      question: "Partners vs curated external job links?",
      answer:
        "Partners help you move; curated external listings are separate—they’re outbound job links labelled clearly when leaving our site.",
    },
  ],
  browseHref: partners,
  browseLabel: "Open partner directory",
  breadcrumbs: [
    { name: "Home", path: home },
    { name: "Global relocation directory", path: "/global-relocation-directory" },
  ],
  relatedGuides: related(
    { href: "/jobs-with-relocation-support", label: "Jobs with relocation support" },
    { href: "/relocating/moving-country-relocation-first-90-days", label: "First 90 days checklist" },
    { href: "/relocating/relocating-move-budget-financial-checklist", label: "Move budget worksheet" },
  ),
};

export const COMPANIES_THAT_SPONSOR_VISAS: SeoPillarPageConfig = {
  path: "/companies-that-sponsor-visas",
  metaTitle: "Companies that sponsor visas: employer due diligence | Global Sponsor Hub",
  metaDescription:
    "Vet visa sponsorship employers before a work abroad move—registers, immigration consistency, contracts, quotas, revocation risk—not buzzwords on a job ad.",
  h1: "How to check if an employer can really sponsor visas",
  intro: `Some job posts say “visa-friendly” but provide little evidence. This guide helps you verify whether an employer is genuinely prepared to sponsor international hires.\n\nUse these checks before you resign, pay fees, or commit to relocation.\n\nPair this page with our offer verification checklist and scam-awareness guide.`,
  lastReviewed: STANDARD_LAST_REVIEWED,
  officialLinks: [
    { label: "US — USCIS toolkit for sponsorship concepts", href: "https://www.uscis.gov/working-in-the-united-states" },
    { label: "UK — Skilled Worker sponsor guidance (comparison mindset)", href: "https://www.gov.uk/government/organisations/uk-visas-and-immigration" },
  ],
  sections: [
    {
      h2: "Why checks vary by country",
      body: `${IN_APP_CORRIDOR_BLURB}\n\nRegisters, licence names and transparency norms differ—adapt your evidence list when switching countries.`,
    },
    {
      h2: "What “can sponsor” should mean in practice",
      body: `Real sponsorship capability usually includes clear processes, named legal pathways, and people who can explain timelines and responsibilities.\n\nGood employers give consistent answers about entities, documentation, and who manages filings.\n\nIf wording is vague or inconsistent, pause and ask for details in writing.`,
    },
    {
      h2: "Evidence to collect before trusting an offer",
      body: `Check public sponsor registers where available, confirm contract details in writing, and look for consistency across recruiter, manager, and HR communication.\n\nReview probation, visa conditions, and any repayment clauses carefully before signing.`,
    },
    {
      h2: "Red flags to treat seriously",
      body: `"We’ll figure out visa later"; requests for cash to unnamed consultants; recruiter-only gmail threads; contradictory programme names—these amplify risk.\nSend candidates to our scam guide if pressure tactics appear.`,
    },
    {
      h2: "How postings on Global Sponsor Hub help (but don’t replace checks)",
      body: `Employers self-declare badges; listings are moderated for inconsistencies.\nYet you **still** reconcile posting copy with diligence artefacts—particularly before resigning.`,
    },
  ],
  faqs: [
    {
      question: "Are sponsor registers always public?",
      answer:
        "Not everywhere. When absent, lean on corroborating paperwork, escrowed relocation budgets, counsel introductions, and written visa pathway references.",
    },
    {
      question: "How do startups differ from conglomerates?",
      answer:
        "Smaller payrolls can sponsor—but may lack dedicated mobility desks. Assess financial resilience and whether external counsel fills gaps.",
    },
    {
      question: "Do sponsor-friendly employers promise roles?",
      answer:
        "Never—labour markets shift; due diligence lowers surprise, not guarantee.",
    },
  ],
  browseHref: JOBS_SPONSOR,
  browseLabel: "Browse jobs with sponsor signals",
  breadcrumbs: [{ name: "Home", path: home }, { name: "Companies sponsoring visas", path: "/companies-that-sponsor-visas" }],
  relatedGuides: related(
    { href: "/relocating/verify-employer-visa-job-offers", label: "Offer verification checklist" },
    { href: "/visa-sponsorship-jobs", label: "Understanding listing badges & filters" },
    { href: "/international-jobs-visa-sponsorship", label: "Compare countries for sponsored work" },
  ),
};

export const JOBS_WITH_RELOCATION_SUPPORT: SeoPillarPageConfig = {
  path: "/jobs-with-relocation-support",
  metaTitle: "Jobs with relocation support: perk packages & filtering | Global Sponsor Hub",
  metaDescription:
    "Relocation packages for international hires—housing, flights, schooling help—and how Relocation Support differs from visa sponsorship. Filter global jobs and pair with country hubs for work abroad planning.",
  h1: "Jobs with relocation support (what the benefit usually means)",
  intro: `This page explains what “Relocation Support” usually means on job listings. It helps you compare offers and ask better questions.\n\nIt is not legal advice. Use official sources and qualified advisers for immigration decisions.`,
  lastReviewed: STANDARD_LAST_REVIEWED,
  sections: [
    {
      h2: "Cost of living still matters",
      body: `${IN_APP_CORRIDOR_BLURB}\n\nRelocation allowances go further in some metros than others—pair perks with corridor research rather than trusting headline dollar amounts.`,
    },
    {
      h2: "Relocation vs visa sponsorship badges",
      body: `**Visa Sponsorship** ⇒ employer signals intent/help on work-authorisation filings.\n**Relocation Support** ⇒ logistics money or services aiding the physical/family move.\n\nNeither badge promises unlimited budgets—always request a relocation policy summary.`,
    },
    {
      h2: "Common components inside packages",
      body: `Flights/class caps, serviced apartment nights, removals, shipments, childcare deposits, commuting stipends, cultural training allowances, concierge apps, schooling search retainers.\n\nSome benefits reimburse after receipts; others are direct-billed by employers through vendor panels listed at /partners/directory.`,
    },
    {
      h2: "Repayment clauses and taxes",
      body: `Clawbacks (repay airfare if quitting <12 months) must be scrutinised legally—jurisdiction-dependent.\n\nModel worst-case payouts using the **financial checklist** spoke before committing.`,
    },
    {
      h2: "How to filter relocation support jobs",
      body: `Use the Relocation Support benefit with location and industry filters to narrow relevant jobs quickly.\n\nIf an employer package is limited, compare support options in the partner directory and plan a realistic personal budget.`,
    },
  ],
  faqs: [
    {
      question: "Must relocation include family flights?",
      answer:
        "Not automatically—negotiate dependents explicitly unless policy states inclusive caps.",
    },
    {
      question: "Cash vs allowance vs reimbursement?",
      answer:
        "Each changes tax optics and FX risk—capture which structure applies per line item.",
    },
  ],
  browseHref: JOBS_RELOC,
  browseLabel: "Search jobs with relocation support",
  breadcrumbs: [{ name: "Home", path: home }, { name: "Relocation support roles", path: "/jobs-with-relocation-support" }],
  relatedGuides: related(
    { href: GLOBAL_RELOCATION_DIRECTORY.path, label: "When to use relocation partners" },
    { href: "/relocating/interview-employer-relocation-visas-benefits", label: "Ask benefits in interviews" },
    { href: partners, label: "Mobility partner directory" },
  ),
};

export const INTERNATIONAL_JOBS_VISA_SPONSORSHIP: SeoPillarPageConfig = {
  path: "/international-jobs-visa-sponsorship",
  metaTitle: "Compare countries for visa-sponsored work | Global Sponsor Hub",
  metaDescription:
    "Plain overview to help you shortlist countries for sponsored work: what to compare, where long-form country guides live, and official government links. Not immigration advice—always confirm rules with each country’s authorities.",
  h1: "Compare countries before you pick one",
  intro: `Not sure **which country** to aim for when you need **employer-backed visas**? This page is **orientation only** — not personal immigration advice.\n\nSkim the table below, open the **country guides** in this app, then use **Discover** with location filters. Always confirm rules on official government sites.`,
  lastReviewed: STANDARD_LAST_REVIEWED,
  officialLinks: [
    { label: "IRCC", href: "https://www.canada.ca/en/immigration-refugees-citizenship.html" },
    { label: "Australia Home Affairs", href: "https://immi.homeaffairs.gov.au/" },
    { label: "USCIS", href: "https://www.uscis.gov/" },
    { label: "EU Immigration Portal (orientation)", href: "https://immigration-portal.ec.europa.eu/" },
  ],
  sections: [
    {
      h2: "Where to open jobs and guides for each country",
      body: `Each **country hub** on Global Sponsor Hub does two things in one place: a short read about that destination **and** a job list already narrowed to that location.\n\n${IN_APP_CORRIDOR_BLURB}\n\nOpen **two or three** hubs you’re seriously considering and compare what matters to you—cost of living tone, language expectations, how employers describe sponsorship—**before** you fix your heart on a single flag.`,
    },
    {
      h2: "Why it helps to keep more than one country in mind",
      body: `Immigration rules and employer demand **shift**. Caps fill, processing slows, or your personal situation (partner, children, licence recognition) can point you elsewhere.\n\nHaving a **second choice** is practical, not pessimistic: it reduces the chance you pause your career because one queue stalled.\n\nOn the admin side, keep basics ready whichever corridor you pursue: valid passport, translations you may need, employment and education records. Requirements vary by country—your hub reading plus official sites tell you what to assemble.`,
    },
    {
      h2: "What to weigh beyond the job title and salary",
      body: `Use this as a personal checklist—not a complete list:\n\n• **Language** — workplace language, exams, and everyday life outside work.\n• **Money** — tax, cost of housing, and whether you need savings for a deposit before the first pay cheque.\n• **Family** — schools, childcare, and partner work permission if that applies to you.\n• **Recognition** — if your profession is regulated (health, teaching, engineering in some markets), plan time and exams.\n• **Timeline** — how long realistic hiring and visa steps might take for people in situations **like** yours (still verify for **your** case).\n\nOur **relocation budget** guide helps you stress-test money; our **employer checklist** helps you sanity-check an offer.`,
    },
    {
      h2: "Turn this into concrete next steps",
      body: `1. **Shortlist** two or three countries using the table and official sites.\n2. Open each **country hub** above and scan jobs with filters (industry, benefits) that match you.\n3. Read how **visa sponsorship** appears on listings on our dedicated jobs guide—so you know what badges mean.\n4. Before you resign from a current job, confirm anything safety-critical with **government guidance** or **licensed immigration advice** for your situation—not with a job board article.`,
    },
  ],
  faqs: [
    {
      question: "Is this page immigration advice?",
      answer:
        "No. It’s general education to help you navigate our site and think about comparisons. For eligibility and filings, use official government sources and, when needed, a regulated immigration adviser.",
    },
    {
      question: "How often should I re-check salary or visa rules?",
      answer:
        "Whenever you move toward a serious application or sign an offer. Salary floors, quotas, and forms change; your notes should reflect the date you last checked an official source.",
    },
    {
      question: "What if I don’t see many jobs in my hub yet?",
      answer:
        "Lists change as employers post. Save a job alert on Global Sponsor Hub, widen industry or benefit filters slightly, and check back—inventory turns over regularly.",
    },
  ],
  browseHref: JOBS_SPONSOR,
  browseLabel: "Search jobs with visa sponsorship",
  breadcrumbs: [{ name: "Home", path: home }, { name: "Compare visa sponsorship by country", path: "/international-jobs-visa-sponsorship" }],
  relatedGuides: related(
    { href: "/jobs/country/canada", label: "Canada — jobs & guide" },
    { href: "/relocating/relocating-move-budget-financial-checklist", label: "Relocation budget checklist" },
    { href: "/companies-that-sponsor-visas", label: "Check an employer’s sponsor signals" },
  ),
  appendixTable: INTERNATIONAL_COMPARISON,
};

export const EMPLOYERS_CORPORATE_GLOBAL_MOBILITY: SeoPillarPageConfig = {
  path: "/employers/corporate-global-mobility",
  metaTitle: "Employer guide: sponsorship and global mobility operations",
  metaDescription:
    "Practical guide for employers hiring internationally: sponsorship compliance, relocation operations, payroll/tax coordination, candidate communication, and where Global Sponsor Hub fits.",
  h1: "Employer guide: sponsorship and global mobility",
  intro: `International hiring is cross-functional: immigration, HR, payroll, tax, legal, and relocation all need to align.\n\nThis guide gives employers a practical overview of what to set up, who should own each area, and where common delays happen.`,
  lastReviewed: STANDARD_LAST_REVIEWED,
  officialLinks: [
    { label: "USCIS — employer resources", href: "https://www.uscis.gov/i-9-central" },
    { label: "IRCC — hire foreign workers orientation", href: "https://www.canada.ca/en/immigration-refugees-citizenship/services/business/canadian-businesses-hire-workers.html" },
  ],
  sections: [
    {
      h2: "Help candidates understand your hiring countries",
      body: `${IN_APP_CORRIDOR_BLURB}\n\nWhen candidates have clear country context, screening conversations are faster and expectations are easier to align.`,
    },
    {
      h2: "What employer mobility programmes usually cover",
      body: `Typical areas include sponsor compliance, visa filing coordination, compensation checks, dependent handling, relocation support, and policy communication.\n\nTeams also need clear escalation paths for exceptions, delays, and legal changes.`,
    },
    {
      h2: "Who should own this internally",
      body: `Core owners usually include Talent Acquisition, HR operations, legal/immigration stakeholders, payroll/tax, and finance. Assign decision owners early to avoid handoff delays.`,
    },
    {
      h2: "How Global Sponsor Hub supports employers",
      body: `Global Sponsor Hub combines employer listings, candidate discovery, and partner access in one workflow.\n\nUse it to publish clear sponsorship/relocation signals, improve applicant quality, and route specialist cases to trusted partners when needed.`,
    },
    {
      h2: "Core service areas",
      body: `Visa pathway selection\nSponsor onboarding / registrations\nRelocation orchestration plus housing/school scouts\nPayroll/comp social security bridging\nDuty-of-care traveller security.`,
    },
  ],
  faqs: [
    {
      question: "Do we need licences in every corridor?",
      answer:
        "Depends—some corridors lean on exemptions; others insist on accreditation; partner counsel inventories obligations.",
    },
    {
      question: "Can lean teams adopt this?",
      answer:
        "Yes—fractional mobility partners augment HRIS + our marketplace tooling for candidate pipeline.",
    },
  ],
  browseHref: forEmployers,
  browseLabel: "Employer plans and tooling",
  breadcrumbs: [{ name: "Home", path: home }, { name: "Employers", path: "/employers" }, { name: "Corporate mobility", path: "/employers/corporate-global-mobility" }],
  relatedGuides: related(
    { href: partners, label: "Partner directory" },
    { href: JOBS_SPONSOR, label: "Example candidate-facing jobs" },
  ),
};

/** All programmatic SEO pillars — sitemap generation */
export const ALL_SEO_PILLAR_PAGES: SeoPillarPageConfig[] = [
  VISA_SPONSORSHIP_JOBS,
  GLOBAL_RELOCATION_DIRECTORY,
  COMPANIES_THAT_SPONSOR_VISAS,
  JOBS_WITH_RELOCATION_SUPPORT,
  INTERNATIONAL_JOBS_VISA_SPONSORSHIP,
  EMPLOYERS_CORPORATE_GLOBAL_MOBILITY,
];

/** Props for `<SeoHubPage />`; metadata stays in route `generateMetadata`. */
export function seoPillarHubProps(config: SeoPillarPageConfig) {
  const { path, metaTitle: _metaTitle, metaDescription: _metaDescription, ...rest } = config;
  void _metaTitle;
  void _metaDescription;
  return { ...rest, visualPath: path };
}
