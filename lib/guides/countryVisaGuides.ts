/**
 * Synced from `global_sponsor_hub-fe/src/data/countryVisaGuides.ts` — copy updates when web guides change.
 */
export type CountryVisaGuidePartnerLink = {
  label: string;
  href: string;
  hint?: string;
};

export type CountryVisaGuideSection = {
  heading: string;
  /** Standard prose blocks */
  paragraphs?: string[];
  /** Labelled bullets — bold lead + supporting text */
  bullets?: { label: string; text: string }[];
  /** Optional two-column pros / cons panel rendered after prose. */
  prosCons?: { pros: string[]; cons: string[] };
  /** Optional highlighted "candidate experience" / note callout. */
  callout?: { title: string; body: string };
  /** Optional visa-pathway stepper ("flowchart" alternative). */
  pathway?: { title?: string; steps: { title: string; detail?: string }[]; note?: string };
};

export function countryGuideSectionPlainText(sec: CountryVisaGuideSection): string {
  const ps = sec.paragraphs ?? [];
  const bs = sec.bullets?.map((b) => `${b.label}: ${b.text}`) ?? [];
  const pros = sec.prosCons?.pros.map((p) => `Pro: ${p}`) ?? [];
  const cons = sec.prosCons?.cons.map((c) => `Con: ${c}`) ?? [];
  const callout = sec.callout ? [`${sec.callout.title}: ${sec.callout.body}`] : [];
  return [...ps, ...bs, ...pros, ...cons, ...callout].join(" ");
}

export type QuickFact = {
  label: string;
  value: string;
};

export type CountryVisaGuide = {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  countryLabel: string;
  /** ISO 3166-1 alpha-2 for flagcdn */
  iso2: string;
  flagEmoji: string;
  updatedISO: string;
  openingHook: string;
  quickFacts: QuickFact[];
  sections: CountryVisaGuideSection[];
  partnerLinks: CountryVisaGuidePartnerLink[];
};

export const COUNTRY_VISA_GUIDES: CountryVisaGuide[] = [
  {
    slug: "uk-skilled-worker-and-sponsored-jobs",
    title: "Working in the UK: how visa sponsorship actually works",
    countryLabel: "United Kingdom",
    iso2: "gb",
    flagEmoji: "🇬🇧",
    excerpt: "What the Skilled Worker route means in practice, what salary you need, and how to find employers who will actually sponsor you.",
    metaDescription: "UK Skilled Worker visa explained: salary thresholds, how sponsorship works, what to check before you apply, and where to find real sponsor-backed roles.",
    updatedISO: "2026-06-22",
    openingHook: "The UK is one of the most active markets for international hiring — but 'sponsorship' gets used loosely. Here's what it means in practice.",
    quickFacts: [
      { label: "Main visa route", value: "Skilled Worker" },
      { label: "Min. salary (general)", value: "£38,700/year" },
      { label: "Employer requirement", value: "Must hold a sponsor licence" },
      { label: "Application time", value: "3–8 weeks typical" },
      { label: "Bring family?", value: "Yes — dependants included" },
      { label: "Path to settlement?", value: "Yes — after 5 years" },
    ],
    sections: [
      {
        heading: "What 'visa sponsorship' actually means",
        paragraphs: [
          "In the UK, an employer can only hire a non-UK/Irish worker through the Skilled Worker route if they hold a Home Office sponsor licence. Not every employer has one. When a listing says 'visa sponsorship available', always verify directly.",
          "The employer assigns you a Certificate of Sponsorship (CoS) — a reference number you use in your visa application. Without this, you cannot apply. The visa is tied to that specific employer and role.",
          "Filter by 'Visa Sponsorship' on the jobs page to see labelled roles. Confirm with the employer in writing during your interview process — before you resign from anything.",
        ],
      },
      {
        heading: "Salary thresholds — what you actually need",
        paragraphs: [
          "The general minimum salary for a Skilled Worker visa is £38,700/year as of April 2024 (or the going rate for your specific occupation code, if higher). This rules out many entry-level roles.",
          "Some shortage occupations — including healthcare and certain engineering roles — have lower thresholds. Always check your specific SOC code against the official Home Office tables.",
          "Roles paying below threshold won't qualify. If an employer offers £30,000 and mentions sponsorship, ask them to explain specifically which visa route applies.",
        ],
      },
      {
        heading: "Finding employers who genuinely sponsor",
        paragraphs: [
          "The Home Office publishes a Register of Licensed Sponsors — a public list of every employer approved to sponsor workers. You can search it by company name before investing time in their process.",
          "Tech, finance, engineering, healthcare, and professional services have the highest concentration of active sponsors. But the sector matters less than the specific employer.",
          "On Global Sponsor Hub, filter by the 'Visa Sponsorship' label as a starting point, then verify directly with the employer early in the process.",
        ],
      },
      {
        heading: "Things that catch people out",
        bullets: [
          {
            label: "Switching roles",
            text: "if you change jobs, your new employer needs to issue a new CoS. Moving employers means restarting the process.",
          },
          {
            label: "Probation",
            text: "your visa is valid during probation. But check for clawback clauses on visa costs if you leave within 12–24 months.",
          },
          {
            label: "Family",
            text: "your partner and children under 18 can apply as dependants and work freely in the UK. The Immigration Health Surcharge (£1,035/year) applies to each family member.",
          },
          {
            label: "Settlement",
            text: "after 5 years on a Skilled Worker visa, you can apply for Indefinite Leave to Remain — permanent residency.",
          },
        ],
      },
    ],
    partnerLinks: [
      { label: "Find UK immigration specialists", href: "/partners/directory", hint: "Filter by Immigration to find regulated advisers." },
      { label: "Search employer-posted UK jobs", href: "/jobs?location=United%20Kingdom" },
    ],
  },
  {
    slug: "ireland-employment-permits-job-search",
    title: "Working in Ireland: employment permits explained",
    countryLabel: "Ireland",
    iso2: "ie",
    flagEmoji: "🇮🇪",
    excerpt: "Ireland's Critical Skills and General Employment Permits, what employers expect, and what arriving actually involves.",
    metaDescription: "Ireland work permit guide for international candidates: Critical Skills vs General permit, salary requirements, and how to find sponsor-backed roles.",
    updatedISO: "2026-06-22",
    openingHook: "Ireland is a genuine tech and pharma hub with active international hiring — but the permit system is less well-known than the UK's. Here's a plain-English breakdown.",
    quickFacts: [
      { label: "Main routes", value: "Critical Skills & General Employment Permit" },
      { label: "Critical Skills threshold", value: "€38,000/year (most roles)" },
      { label: "Labour market test?", value: "No — for Critical Skills roles" },
      { label: "Application time", value: "6–12 weeks typical" },
      { label: "Bring family?", value: "Yes — after permit approval" },
      { label: "Path to residency?", value: "Stamp 4 after qualifying period" },
    ],
    sections: [
      {
        heading: "Two main permits — and which one you want",
        paragraphs: [
          "The Critical Skills Employment Permit (CSEP) is faster, doesn't require a labour market test, and gives you more flexibility — including the right to bring your family immediately and change employers after two years.",
          "The General Employment Permit (GEP) requires a labour market test in most cases but covers a wider range of occupations.",
          "To qualify for Critical Skills, your role typically needs to be on the Critical Skills Occupations List and meet salary thresholds — currently €38,000/year for most roles.",
        ],
      },
      {
        heading: "What to ask the employer early",
        paragraphs: [
          "Ireland's permit system puts responsibility on the employer — they apply on your behalf. Ask early whether they've done this before. Companies experienced with permits move faster.",
          "Confirm which permit type applies and who pays the fee (up to €1,500 — often the employer covers this). Ask about timeline — 6–12 weeks is typical.",
          "Your employment contract must be in place before the permit can be issued: offer → contract → permit application → permit approval → you arrive.",
        ],
      },
      {
        heading: "Arriving in Ireland: the first few weeks",
        bullets: [
          {
            label: "GNIB registration",
            text: "when you arrive, register with the Garda National Immigration Bureau (GNIB) within 90 days. You'll get a stamp in your passport that is your formal permission to be in Ireland.",
          },
          {
            label: "PPS number",
            text: "you'll need a PPS number (Ireland's equivalent of a National Insurance number) for tax, healthcare, banking, and most official services. Apply at your local Intreo office.",
          },
          {
            label: "Housing",
            text: "Dublin housing is competitive. Many employers who hire internationally include relocation allowances or temporary accommodation — ask about this before accepting.",
          },
        ],
      },
    ],
    partnerLinks: [
      { label: "Find Ireland-specialist relocation partners", href: "/partners/directory" },
      { label: "Search jobs in Ireland", href: "/jobs?location=Ireland" },
    ],
  },
  {
    slug: "germany-eu-blue-card-jobseekers",
    title: "Working in Germany: EU Blue Card and getting hired",
    countryLabel: "Germany",
    iso2: "de",
    flagEmoji: "🇩🇪",
    excerpt: "EU Blue Card salary thresholds, how credential recognition works, and what to expect from German employers hiring internationally.",
    metaDescription: "Germany EU Blue Card guide: salary thresholds for 2026, credential recognition for engineers, what German employers expect, and how to find sponsored roles.",
    updatedISO: "2026-06-22",
    openingHook: "Germany actively wants international talent but has a reputation for complexity. The EU Blue Card cuts through a lot of that — if your qualifications and salary meet the bar.",
    quickFacts: [
      { label: "Main route for non-EU", value: "EU Blue Card" },
      { label: "Salary threshold (general)", value: "~€45,300/year (2024)" },
      { label: "Shortage occupations", value: "~€41,042/year (2024)" },
      { label: "Language requirement", value: "None for Blue Card" },
      { label: "Path to permanent residency", value: "33 months (21 with B1 German)" },
      { label: "Bring family?", value: "Yes — immediately on Blue Card" },
    ],
    sections: [
      {
        heading: "The EU Blue Card — what it is and who qualifies",
        paragraphs: [
          "The EU Blue Card is Germany's main skilled worker visa for non-EU nationals with a university degree. If your degree is recognised and your salary meets the threshold, it's faster and more flexible than other routes.",
          "In 2024, the general threshold is approximately €45,300/year. For shortage occupations (including engineering, IT, healthcare, science), the threshold is lower — around €41,042/year.",
          "Your degree must be officially recognised in Germany. For most candidates from countries in the ANABIN database at the highest recognition level (H+), this is straightforward.",
        ],
        pathway: {
          title: "EU Blue Card pathway (high level)",
          steps: [
            { title: "Secure a qualifying job offer", detail: "A role that matches your degree from a German employer." },
            { title: "Confirm degree recognition", detail: "Check ANABIN / ZAB; regulated professions need state-level recognition." },
            { title: "Meet the salary threshold", detail: "General ~€45,300; shortage occupations ~€41,042 (2024 figures — verify)." },
            { title: "Apply for the Blue Card", detail: "Via the German mission abroad or locally if already in Germany." },
            { title: "Register your address (Anmeldung)", detail: "Within two weeks of arrival — needed for almost everything else." },
            { title: "Receive your residence permit", detail: "Blue Card issued; family can join immediately." },
          ],
          note: "Illustrative sequence only. Confirm current thresholds and steps on the official Make it in Germany / BAMF sites.",
        },
      },
      {
        heading: "Getting your qualifications recognised",
        paragraphs: [
          "Engineers often need qualifications checked through ANABIN (a database of recognised foreign universities) or ZAB (the German academic equivalency agency).",
          "For regulated professions — medicine, dentistry, pharmacy, law, architecture — recognition is stricter and managed at state level. This can take 3–12 months. Start before you apply for jobs.",
          "IT and tech roles can qualify based on proven professional experience even without a formal degree under recent rule changes — but the criteria are specific.",
        ],
      },
      {
        heading: "Practical things nobody tells you",
        bullets: [
          {
            label: "Anmeldung",
            text: "registering your address is required within two weeks of arrival and needed for almost everything else: bank accounts, tax numbers, health insurance. Do it first.",
          },
          {
            label: "Health insurance",
            text: "German health insurance is mandatory and deducted at source. You'll be automatically enrolled in the public system unless your income is high enough to opt for private.",
          },
          {
            label: "Language",
            text: "the Blue Card doesn't require German. But outside the largest companies and tech hubs, daily working life is often in German. Many employers offer language classes — ask.",
          },
        ],
      },
      {
        heading: "Germany at a glance: pros and cons",
        paragraphs: [
          "Every destination involves trade-offs. Weigh these against your own priorities — and read the official sources before you commit.",
        ],
        prosCons: {
          pros: [
            "EU Blue Card and skilled routes with clear, published salary thresholds.",
            "Strong manufacturing, engineering, and IT sectors actively hiring internationally.",
            "Excellent public transport and easy weekend travel across the Schengen Area.",
            "Family can join immediately on the Blue Card.",
          ],
          cons: [
            "Address registration (Anmeldung) and bureaucracy can cause early delays.",
            "German is often needed for daily life and many roles outside large tech firms.",
            "Recognition of regulated professions (medicine, law, architecture) takes time.",
            "Housing in Munich, Berlin, and Frankfurt is competitive and expensive.",
          ],
        },
        callout: {
          title: "Candidate experience",
          body:
            "An Indian software engineer moved to Berlin on a Blue Card in under three months once the salary cleared the shortage-occupation threshold. The job itself was smooth; the slow part was securing an Anmeldung appointment and a long-term flat — both of which they wish they'd started before arriving.",
        },
      },
    ],
    partnerLinks: [
      { label: "Find Germany-focused immigration partners", href: "/partners/directory" },
      { label: "Search jobs in Germany", href: "/jobs?location=Germany" },
    ],
  },
  {
    slug: "canada-work-permit-jobs",
    title: "Working in Canada: work permits and getting hired",
    countryLabel: "Canada",
    iso2: "ca",
    flagEmoji: "🇨🇦",
    excerpt: "Canada's main work permit routes, what employers need to do, and how to find roles that lead to permanent residency.",
    metaDescription: "Canada work permit guide: LMIA process, Express Entry, what employers sponsor, and how to find international roles in Canada.",
    updatedISO: "2026-05-01",
    openingHook: "Canada is one of the most active countries for skilled international hiring with clear pathways to permanent residency — but the process involves more employer paperwork than most candidates expect.",
    quickFacts: [
      { label: "Main employer route", value: "LMIA + Work Permit" },
      { label: "Fast-track route", value: "Express Entry (LMIA-exempt in some cases)" },
      { label: "Employer requirement", value: "Labour Market Impact Assessment (most cases)" },
      { label: "Processing time", value: "Varies widely by province and route" },
      { label: "Bring family?", value: "Yes — open work permit for spouse" },
      { label: "Path to PR?", value: "Yes — Express Entry and provincial programmes" },
    ],
    sections: [
      {
        heading: "How Canadian employer sponsorship works",
        paragraphs: [
          "Most employers hiring foreign workers need a Labour Market Impact Assessment (LMIA) — a document showing no suitable Canadian citizen or permanent resident was available for the role. This takes time and costs the employer money, which is why many smaller companies don't sponsor.",
          "Some roles are LMIA-exempt — particularly intra-company transfers, roles under trade agreements (like CUSMA for US and Mexican nationals), and certain professionals. Ask the employer specifically which pathway applies to your situation.",
          "With a valid job offer and LMIA, you can apply for a work permit. Processing times vary significantly by country of application and current IRCC volumes.",
        ],
      },
      {
        heading: "Express Entry and permanent residency",
        paragraphs: [
          "Express Entry is Canada's main system for skilled worker permanent residency. You create a profile, get a Comprehensive Ranking System (CRS) score, and may receive an Invitation to Apply (ITA) during draw rounds.",
          "A valid job offer from a Canadian employer can add significant CRS points. Provincial Nominee Programs (PNPs) offer another route — individual provinces can nominate candidates and add points to their CRS score.",
          "The pathway from work permit to permanent residency is one of the clearest in the world — but it requires planning, patience, and often professional advice.",
        ],
        pathway: {
          title: "Work permit → permanent residence (high level)",
          steps: [
            { title: "Get a job offer (or qualify on points)", detail: "Many roles need an LMIA; some are LMIA-exempt (e.g. CUSMA, intra-company)." },
            { title: "Obtain an LMIA where required", detail: "Employer proves no suitable Canadian was available." },
            { title: "Apply for a work permit", detail: "Processing times vary by country and IRCC volumes." },
            { title: "Create an Express Entry profile", detail: "Get a CRS score; a job offer or PNP can add significant points." },
            { title: "Receive an Invitation to Apply (ITA)", detail: "Issued during draw rounds above the cut-off score." },
            { title: "Apply for permanent residence", detail: "Submit documents; spouse may get an open work permit." },
          ],
          note: "Illustrative only. Routes and cut-offs change — verify on the official IRCC site.",
        },
      },
      {
        heading: "Where international hiring is most active",
        paragraphs: [
          "Healthcare, technology, engineering, and skilled trades have the most active international hiring. Ontario, British Columbia, and Alberta have the highest concentration of employers using Global Sponsor Hub.",
          "Many Canadian employers list salary ranges openly — factor in provincial income tax rates, which vary significantly. Take-home pay in Alberta (no provincial income tax) differs from Quebec.",
        ],
      },
      {
        heading: "Canada at a glance: pros and cons",
        paragraphs: [
          "Canada is one of the clearest work-to-residence stories in the world, but the employer paperwork is real. Weigh the trade-offs for your situation.",
        ],
        prosCons: {
          pros: [
            "One of the clearest pathways from work permit to permanent residence (Express Entry, PNPs).",
            "Open work permit for your spouse in many cases.",
            "Active hiring in healthcare, tech, engineering, and skilled trades.",
            "Some routes are LMIA-exempt (intra-company transfers, trade agreements).",
          ],
          cons: [
            "Most employer sponsorship needs an LMIA — costly and slow, so smaller firms often won't.",
            "Processing times vary widely by province and IRCC volumes.",
            "Provincial taxes and cost of living differ sharply (Alberta vs Quebec vs BC).",
            "Regulated occupations require provincial licensing before you can practise.",
          ],
        },
        callout: {
          title: "Candidate experience",
          body:
            "A nurse from the Philippines landed a British Columbia role via a provincial stream, but the licensing and credential assessment took longer than the job offer itself. Starting the regulatory paperwork early was the single biggest time-saver.",
        },
      },
    ],
    partnerLinks: [
      { label: "Find Canada immigration specialists", href: "/partners/directory" },
      { label: "Search jobs in Canada", href: "/jobs?location=Canada" },
    ],
  },
  {
    slug: "australia-skilled-visa-jobs",
    title: "Working in Australia: skilled visas and employer sponsorship",
    countryLabel: "Australia",
    iso2: "au",
    flagEmoji: "🇦🇺",
    excerpt: "Australia's employer-sponsored visa routes, skills assessments, and how to find roles that lead to permanent residency.",
    metaDescription: "Australia work visa guide: Temporary Skill Shortage (subclass 482), skills assessment, employer sponsorship, and pathways to permanent residency.",
    updatedISO: "2026-05-01",
    openingHook: "Australia has a structured employer sponsorship system with a genuine pathway to permanent residency — but the process involves skills assessments and specific occupational lists that determine your eligibility.",
    quickFacts: [
      { label: "Main employer route", value: "Temporary Skill Shortage (subclass 482)" },
      { label: "Skills assessment?", value: "Required for many occupations" },
      { label: "Employer requirement", value: "Must be an approved sponsor" },
      { label: "Processing time", value: "2–6 months typical" },
      { label: "Bring family?", value: "Yes — secondary applicants" },
      { label: "Path to PR?", value: "Yes — after 2–3 years in many cases" },
    ],
    sections: [
      {
        heading: "The Temporary Skill Shortage (TSS) visa",
        paragraphs: [
          "The TSS visa (subclass 482) is the main employer-sponsored route for skilled workers. Your occupation must be on the Short-term Skilled Occupation List (STSOL) or Medium and Long-term Strategic Skills List (MLTSSL). The MLTSSL occupations lead to permanent residency — the STSOL typically does not.",
          "Employers must be approved sponsors before they can nominate you. Not all employers are, so ask early in the process. The employer pays the nomination fee; you pay the visa application fee.",
          "Skills assessments are required for many occupations and can take several weeks to months. Start this process before you begin applying.",
        ],
        pathway: {
          title: "TSS (482) → permanent residence (high level)",
          steps: [
            { title: "Check your occupation list", detail: "MLTSSL leads to PR; STSOL typically does not." },
            { title: "Complete a skills assessment", detail: "Required for many occupations — can take weeks to months." },
            { title: "Find an approved sponsor", detail: "Only approved sponsors can nominate you; employer pays the nomination fee." },
            { title: "Apply for the TSS (subclass 482)", detail: "You pay the visa application fee; processing ~2–6 months." },
            { title: "Work ~2 years in an MLTSSL role", detail: "Builds eligibility for employer-nominated PR." },
            { title: "Apply for ENS (subclass 186)", detail: "Permanent residence via the Employer Nomination Scheme." },
          ],
          note: "Illustrative only. Occupation lists and thresholds change — verify on the official Department of Home Affairs site.",
        },
      },
      {
        heading: "Pathway to permanent residency",
        paragraphs: [
          "After 2 years on a TSS visa in an MLTSSL occupation, you may be eligible for the Employer Nomination Scheme (ENS subclass 186) — a permanent residency visa.",
          "The Skilled Independent visa (subclass 189) and Skilled Nominated visa (subclass 190) offer pathways without employer sponsorship for high-scoring candidates in Express Entry equivalent points systems.",
        ],
      },
      {
        heading: "Cost of living and salary context",
        paragraphs: [
          "Australia has a minimum salary requirement for sponsored workers (the Temporary Skilled Migration Income Threshold — TSMIT). As of 2024 this is AUD 70,000/year. Most sponsored roles pay significantly above this.",
          "Sydney and Melbourne are expensive cities — housing costs are high relative to salaries. Brisbane, Adelaide, and Perth offer similar opportunities with lower living costs.",
        ],
      },
      {
        heading: "Australia at a glance: pros and cons",
        paragraphs: [
          "Australia pairs a structured sponsorship system with a real PR pathway — but eligibility hinges on occupation lists and skills assessments. Weigh the trade-offs.",
        ],
        prosCons: {
          pros: [
            "Structured employer sponsorship with a genuine pathway to permanent residency.",
            "MLTSSL occupations lead to PR via the Employer Nomination Scheme after 2 years.",
            "Regional incentives and points routes (subclass 189/190) for high scorers.",
            "Strong demand and high salaries in many skilled fields.",
          ],
          cons: [
            "Skills assessments are required for many occupations and take weeks to months.",
            "Only approved sponsors can nominate you — not every employer qualifies.",
            "STSOL occupations often don't lead to permanent residence.",
            "Sydney and Melbourne housing is expensive; distance from family and climate risks matter.",
          ],
        },
        callout: {
          title: "Candidate experience",
          body:
            "A mechanical engineer from the UK secured a subclass 482 role in Perth in about four months. The skills assessment was the gating step — booking it before job-hunting meant the visa stage moved quickly once the offer landed.",
        },
      },
    ],
    partnerLinks: [
      { label: "Find Australia immigration specialists", href: "/partners/directory" },
      { label: "Search jobs in Australia", href: "/jobs?location=Australia" },
    ],
  },
  {
    slug: "usa-work-visa-jobs",
    title: "Working in the USA: H-1B and employer-sponsored visas",
    countryLabel: "United States",
    iso2: "us",
    flagEmoji: "🇺🇸",
    excerpt: "H-1B lottery, O-1 alternatives, what US employers actually do for international hires, and realistic timelines.",
    metaDescription: "USA work visa guide for international candidates: H-1B lottery, O-1 visa, what US employers sponsor, and how to find roles that lead to green card pathways.",
    updatedISO: "2026-05-01",
    openingHook: "The US has a complex and lottery-dependent visa system. It's still one of the highest-paying markets in the world — but international candidates need to understand the process before applying.",
    quickFacts: [
      { label: "Main employer route", value: "H-1B (specialty occupations)" },
      { label: "H-1B lottery?", value: "Yes — annual lottery, high competition" },
      { label: "Alternative routes", value: "O-1, L-1, TN (Canadians/Mexicans)" },
      { label: "Employer requirement", value: "Prevailing wage + USCIS petition" },
      { label: "H-1B cap", value: "65,000 (+ 20,000 advanced degree exemption)" },
      { label: "Path to green card?", value: "Yes — employer-sponsored EB-2/EB-3" },
    ],
    sections: [
      {
        heading: "The H-1B lottery — what you need to know",
        paragraphs: [
          "The H-1B is the main visa for specialty occupation workers (typically requiring a bachelor's degree or equivalent). The annual cap is 65,000 plus 20,000 for US master's degree holders. Applications far exceed this — selection is by lottery in April each year.",
          "If you're selected, your employer files a full petition. If not selected, you must wait for the next year's lottery. This uncertainty means many candidates pursue other routes or companies that sponsor OPT extensions while building lottery odds.",
          "Companies that regularly sponsor H-1Bs are generally larger tech firms, consulting companies, and financial institutions. Smaller companies often can't absorb the cost and uncertainty.",
        ],
      },
      {
        heading: "Alternative visa routes worth knowing",
        bullets: [
          {
            label: "O-1 visa",
            text: "for individuals with extraordinary ability in their field. Harder to qualify for but no lottery. Processing is faster and the criteria, while subjective, can be met by people with strong publication records, awards, or high compensation.",
          },
          {
            label: "L-1 visa",
            text: "for intra-company transferees. If your employer has US operations, this can be faster and more predictable than H-1B.",
          },
          {
            label: "TN visa",
            text: "for Canadian and Mexican citizens under CUSMA/USMCA. Covers a specific list of professions and is relatively straightforward at the border.",
          },
        ],
      },
      {
        heading: "Salary context and what to expect",
        paragraphs: [
          "US tech salaries are the highest in the world for software engineers — especially in San Francisco, New York, and Seattle. But cost of living in those cities is also extreme.",
          "Employers must pay the 'prevailing wage' for H-1B roles — you can look this up on the Department of Labor's Foreign Labor Certification Data Center to sanity-check any offer.",
        ],
      },
    ],
    partnerLinks: [
      { label: "Find US immigration specialists", href: "/partners/directory" },
      { label: "Search jobs in the United States", href: "/jobs?location=United%20States" },
    ],
  },
  {
    slug: "uae-work-visa-jobs",
    title: "Working in the UAE: work visas and getting hired in Dubai",
    countryLabel: "UAE",
    iso2: "ae",
    flagEmoji: "🇦🇪",
    excerpt: "UAE work permits, how employer sponsorship works, and what international candidates need to know about living and working in Dubai or Abu Dhabi.",
    metaDescription: "UAE work visa guide: how employer sponsorship works in Dubai and Abu Dhabi, Golden Visa eligibility, salary expectations, and finding international roles.",
    updatedISO: "2026-05-01",
    openingHook: "The UAE is one of the world's most international workforces — over 88% of residents are expats. Getting a work visa is employer-led and relatively straightforward once you have an offer.",
    quickFacts: [
      { label: "Main route", value: "Employer-sponsored work permit" },
      { label: "Employer requirement", value: "UAE-licensed company must sponsor" },
      { label: "Long-stay option", value: "Golden Visa (5–10 years)" },
      { label: "Income tax?", value: "No personal income tax" },
      { label: "Bring family?", value: "Yes — residence visas for dependants" },
      { label: "Processing time", value: "1–4 weeks typical" },
    ],
    sections: [
      {
        heading: "How UAE employer sponsorship works",
        paragraphs: [
          "In the UAE, your employer is your visa sponsor. A UAE-licensed company applies for a work permit from the Ministry of Human Resources and Emiratisation (MOHRE) and then issues you a residence visa.",
          "The process: job offer → employer applies for work permit approval → you enter on an employment entry visa → medical and biometrics → residence visa stamped in your passport. This typically takes 2–6 weeks once you've arrived.",
          "Your visa is tied to your employer. If you change jobs, your new employer cancels the old visa and issues a new one. There's typically a grace period — confirm the current rules as they change periodically.",
        ],
      },
      {
        heading: "The Golden Visa — longer-term options",
        paragraphs: [
          "The UAE Golden Visa offers 5 or 10-year residency for qualifying individuals: investors, entrepreneurs, highly skilled professionals (in specific fields), and top students. It's employer-independent.",
          "Some employers — particularly large multinationals and tech companies — sponsor Golden Visas for senior hires. Ask about this if you're in a qualifying profession (engineering, IT, healthcare, research).",
        ],
      },
      {
        heading: "Salary and practical expectations",
        paragraphs: [
          "There is no personal income tax in the UAE — your gross salary is your take-home (minus pension contributions for some nationalities). This makes UAE salaries directly comparable to higher-tax countries at a higher net income.",
          "Dubai and Abu Dhabi are expensive cities. Housing is the biggest cost — many employers include housing allowances for senior roles, which is worth factoring into any offer comparison.",
          "The UAE has a mandatory health insurance requirement — your employer must provide it. Confirm the coverage level before accepting.",
        ],
      },
    ],
    partnerLinks: [
      { label: "Find UAE relocation specialists", href: "/partners/directory" },
      { label: "Search jobs in the UAE", href: "/jobs?location=United%20Arab%20Emirates" },
    ],
  },
  {
    slug: "singapore-employment-pass-jobs",
    title: "Working in Singapore: Employment Pass and getting hired",
    countryLabel: "Singapore",
    iso2: "sg",
    flagEmoji: "🇸🇬",
    excerpt: "Singapore's Employment Pass salary thresholds, fair hiring requirements, and what tech and finance candidates need to know.",
    metaDescription: "Singapore Employment Pass guide: salary thresholds, COMPASS framework, fair hiring requirements, and how to find sponsored roles in Singapore's tech and finance sectors.",
    updatedISO: "2026-05-01",
    openingHook: "Singapore is Asia's most international business hub with active hiring in tech, finance, and professional services — but the Employment Pass system has become more selective in recent years.",
    quickFacts: [
      { label: "Main route", value: "Employment Pass (EP)" },
      { label: "Min. salary (general)", value: "SGD 5,600/month (2025)" },
      { label: "Min. salary (financial services)", value: "SGD 6,200/month (2025)" },
      { label: "COMPASS assessment?", value: "Yes — points-based evaluation" },
      { label: "Bring family?", value: "Yes — Dependant's Pass" },
      { label: "Path to PR?", value: "Yes — after sustained employment" },
    ],
    sections: [
      {
        heading: "The Employment Pass — what's changed",
        paragraphs: [
          "Singapore's Employment Pass (EP) is the main work visa for professionals, managers, and executives. Since 2023, all new EP applications go through the COMPASS framework — a points-based system evaluating salary, qualifications, diversity, and skills.",
          "The minimum salary for an EP is SGD 5,600/month (2025) for most sectors, and SGD 6,200/month for financial services roles. Older candidates need to earn more — the threshold scales with age.",
          "COMPASS assesses your application against four criteria: your salary vs peers, your qualifications, whether your nationality adds diversity to the employer's workforce, and whether your role is on the shortage occupations list.",
        ],
      },
      {
        heading: "Fair hiring — what it means for you",
        paragraphs: [
          "Singapore has strong fair hiring laws. Employers must advertise roles on MyCareersFuture before hiring foreigners for most positions (Job Support Scheme roles and roles above SGD 22,500/month are exempt).",
          "This means employers who genuinely want to hire international talent go through a documented process — which actually makes them more committed to the hire once they've made the decision.",
        ],
      },
    ],
    partnerLinks: [
      { label: "Find Singapore relocation specialists", href: "/partners/directory" },
      { label: "Search jobs in Singapore", href: "/jobs?location=Singapore" },
    ],
  },
  {
    slug: "netherlands-highly-skilled-migrant-jobs",
    title: "Working in the Netherlands: Highly Skilled Migrant permit",
    countryLabel: "Netherlands",
    iso2: "nl",
    flagEmoji: "🇳🇱",
    excerpt: "The Netherlands Highly Skilled Migrant route, salary thresholds, and why Amsterdam and Eindhoven attract international tech talent.",
    metaDescription: "Netherlands Highly Skilled Migrant permit guide: salary thresholds for 2024, which employers can sponsor, the 30% ruling tax benefit, and how to find sponsored roles.",
    updatedISO: "2026-05-01",
    openingHook: "The Netherlands has one of Europe's most straightforward routes for international professionals — the Highly Skilled Migrant permit can be issued in as little as two weeks if the employer is a recognised sponsor.",
    quickFacts: [
      { label: "Main route", value: "Highly Skilled Migrant (kennismigrant)" },
      { label: "Min. salary (under 30)", value: "€3,672/month gross (2024)" },
      { label: "Min. salary (30+)", value: "€5,008/month gross (2024)" },
      { label: "Employer requirement", value: "Must be IND-recognised sponsor" },
      { label: "Processing time", value: "As fast as 2 weeks" },
      { label: "30% ruling?", value: "Tax benefit for qualifying expats" },
    ],
    sections: [
      {
        heading: "The Highly Skilled Migrant permit",
        paragraphs: [
          "The Highly Skilled Migrant (kennismigrant) permit is the Netherlands' fast-track route for international professionals. Your employer must be a recognised sponsor with the IND (Immigration and Naturalisation Service).",
          "If your employer is a recognised sponsor, permit processing can be as fast as two weeks — one of the quickest in Europe. Check whether a company is a recognised sponsor on the IND website before applying.",
          "Salary thresholds are reviewed annually. In 2024: €5,008/month gross for applicants 30 and over, and €3,672/month for those under 30. Reduced thresholds apply for graduates from Dutch universities within three years of graduation.",
        ],
      },
      {
        heading: "The 30% ruling — a significant benefit",
        paragraphs: [
          "The 30% ruling allows qualifying expats to receive up to 30% of their salary tax-free for the first 5 years. This effectively increases take-home pay significantly for higher earners.",
          "To qualify: you must be recruited abroad, earn above a minimum threshold (€46,107/year in 2024 for most roles), and have lived more than 150km from the Dutch border for at least 16 of the 24 months before employment.",
          "The Dutch government has periodically reviewed this benefit — confirm current rules with a tax adviser.",
        ],
      },
    ],
    partnerLinks: [
      { label: "Find Netherlands relocation specialists", href: "/partners/directory" },
      { label: "Search jobs in the Netherlands", href: "/jobs?location=Netherlands" },
    ],
  },
  {
    slug: "new-zealand-accredited-employer-jobs",
    title: "Working in New Zealand: Accredited Employer Work Visa",
    countryLabel: "New Zealand",
    iso2: "nz",
    flagEmoji: "🇳🇿",
    excerpt: "New Zealand's Accredited Employer Work Visa, which employers can sponsor, and the pathway to residence for skilled workers.",
    metaDescription: "New Zealand Accredited Employer Work Visa guide: how AEWV works, which employers are accredited, median wage requirements, and pathways to residence.",
    updatedISO: "2026-05-01",
    openingHook: "New Zealand's Accredited Employer Work Visa (AEWV) system means only employers who've been through an accreditation process can hire internationally — which makes the offers more credible.",
    quickFacts: [
      { label: "Main route", value: "Accredited Employer Work Visa (AEWV)" },
      { label: "Employer requirement", value: "Must be accredited by Immigration NZ" },
      { label: "Salary requirement", value: "NZD median wage or higher (role-dependent)" },
      { label: "Labour market test?", value: "Yes — in most cases" },
      { label: "Bring family?", value: "Yes — with qualifying salary" },
      { label: "Path to residence?", value: "Yes — via Skilled Migrant Category" },
    ],
    sections: [
      {
        heading: "How the Accredited Employer Work Visa works",
        paragraphs: [
          "Only employers accredited by Immigration New Zealand can hire international workers under the AEWV. Accreditation comes in two levels — standard (up to 5 migrants) and high-volume (more than 5).",
          "Your employer must check that no suitable New Zealand citizen or resident is available (the labour market test), unless your role is exempt (e.g., above the NZD median wage threshold for certain occupations).",
          "Processing times have improved but can still take 4–8 weeks for the full visa. Your employer should be familiar with the process — if they're not, that's a warning sign.",
        ],
      },
      {
        heading: "Pathway to residence",
        paragraphs: [
          "The Skilled Migrant Category (SMC) is the main pathway to New Zealand residence for skilled workers. It uses a points system based on skilled employment, qualifications, age, and time in NZ.",
          "For healthcare, construction, and some engineering roles, the Straight-to-Residence (S2R) pathway offers direct permanent residency without going through a temporary work visa stage first.",
        ],
      },
    ],
    partnerLinks: [
      { label: "Find New Zealand immigration specialists", href: "/partners/directory" },
      { label: "Search jobs in New Zealand", href: "/jobs?location=New%20Zealand" },
    ],
  },
];

export function getCountryVisaGuide(slug: string): CountryVisaGuide | undefined {
  return COUNTRY_VISA_GUIDES.find((g) => g.slug === slug);
}

export function listCountryVisaGuideSummaries(): Pick<
  CountryVisaGuide,
  "slug" | "title" | "excerpt" | "countryLabel" | "iso2" | "flagEmoji"
>[] {
  return COUNTRY_VISA_GUIDES.map(({ slug, title, excerpt, countryLabel, iso2, flagEmoji }) => ({
    slug,
    title,
    excerpt,
    countryLabel,
    iso2,
    flagEmoji,
  }));
}
