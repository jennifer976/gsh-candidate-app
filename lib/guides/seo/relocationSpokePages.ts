import type { SeoPillarPageConfig } from "./seoPillarTypes";

const home = "/";
const guides = "/guides";
const partners = "/partners/directory";
const JOBS_SPONSOR = "/jobs?benefit=Visa Sponsorship";
const JOBS_RELOC = "/jobs?benefit=Relocation Support";

function bc(last: { name: string; path: string }) {
  return [{ name: "Home", path: home }, { name: "Guides", path: guides }, last];
}

const STANDARD_LAST_REVIEWED = "2026-04-30";
const CORRIDOR_HUB_NAV =
  "**Country hubs (extra context):** [Canada](/jobs/country/canada) · [Australia](/jobs/country/australia) · [United States](/jobs/country/usa) · [Germany](/jobs/country/germany) · [United Arab Emirates](/jobs/country/uae) · [Ireland](/jobs/country/ireland) · [Singapore](/jobs/country/singapore) · [New Zealand](/jobs/country/new-zealand) · [Netherlands](/jobs/country/netherlands) · [Switzerland](/jobs/country/switzerland).";

/** Candidate relocation & trust “spokes” under `/relocating/*` — linked from `/guides` and pillars. */
export const RELOCATION_GUIDE_PAGES: Record<string, SeoPillarPageConfig> = {
  "job-offers-scams-red-flags": {
    path: "/relocating/job-offers-scams-red-flags",
    metaTitle: "Job offer & visa sponsorship scams: red flags | Global Sponsor Hub",
    metaDescription:
      "International job offer scams & fake visa sponsorship—paying up front, cloned employers, pressure tactics, broker fees. Protect yourself before you relocate or accept a work abroad role.",
    h1: "Job offers, visas & relocation scams — red flags",
    intro: `Moving for work is high stakes. Most employers and recruiters are legitimate—but cross-border hiring also attracts fraud: cloned career sites, “guaranteed” visas, and requests for cash up front.\n\nThis page is practical risk reduction, not legal advice. If something feels off, pause, verify through independent channels, and speak with a regulated immigration adviser where appropriate.`,
    lastReviewed: STANDARD_LAST_REVIEWED,
    officialLinks: [
      { label: "US FTC — Job scams", href: "https://consumer.ftc.gov/articles/job-scams" },
      { label: "Canada — Fraud prevention basics (RCMP orientation)", href: "https://www.rcmp-grc.gc.ca/en/scams-fraud" },
      { label: "UK Action Fraud orientation", href: "https://www.actionfraud.police.uk/" },
    ],
    sections: [
      {
        h2: "Who needs this guide and why country context matters",
        body: `Candidates paying deposits in foreign currencies, managing time zones, and relying on chat apps face higher fraud exposure.\n\n${CORRIDOR_HUB_NAV}\n\nScams often copy local wording. If visa terms look unfamiliar or inconsistent, verify directly on official government websites.`,
      },
      {
        h2: "Fee red flags (candidate-paid visas & guarantees)",
        body: `You should be deeply sceptical if anyone demands that *you* pay government filing fees to a personal account, buy “priority processing,” or transfer money before a formal contract exists.\n\nLegitimate employers may reimburse certain costs through payroll—but **“pay us to secure your visa”** from a stranger is a classic pattern. No one can honestly guarantee a government decision.\n\nIf you are unsure, compare the process described in the offer with your destination’s **official immigration website** and your embassy’s published guidance.`,
      },
      {
        h2: "Identity & employer verification",
        body: `Scammers impersonate real companies. Before sharing passport scans or bank details:\n\nMatch the application domain to the company’s known site; don’t trust a freemail address as the primary hiring channel.\nCross-check the role on the employer’s **official careers** page or verified ATS link.\nSearch the recruiter’s name + company + “scam” for prior reports.\n\nOn Global Sponsor Hub, roles are **employer-posted** and surfaced with structured benefit labels—still verify every offer directly with the employer’s HR or hiring manager contact you obtained independently.`,
      },
      {
        h2: "Pressure, secrecy & “too good to be true” offers",
        body: `Be cautious if you must decide in hours, if you’re told to keep the offer secret from family, or if compensation is far above market with no interview rigour.\n\nRelocation adds complexity—flights, deposits, school places—so fraudsters exploit urgency. A real team will answer reasonable questions about contract, start date, visa route, and written benefit summaries.`,
      },
      {
        h2: "What to do if you suspect fraud",
        body: `Stop sending money or documents. Preserve emails, contracts, and transfer receipts.\nReport through your local consumer protection or cyber-crime channel where available, and warn your bank if you sent funds.\nThen continue your search using verified listings—our **partner directory** lists mobility specialists you can vet for your corridor.`,
      },
    ],
    faqs: [
      {
        question: "Should candidates ever pay recruitment fees?",
        answer:
          "Practices vary by country and role type, but large upfront fees for “visa processing” to unknown third parties are a major warning sign. Verify what is normal in your destination and role before paying anything.",
      },
      {
        question: "Does Global Sponsor Hub vet every employer personally?",
        answer:
          "We curate listings and respond to reports, but candidates should still perform independent employer verification—especially before relocating.",
      },
    ],
    browseHref: JOBS_SPONSOR,
    browseLabel: "Browse verified-style job listings",
    breadcrumbs: bc({ name: "Scams & red flags", path: "/relocating/job-offers-scams-red-flags" }),
    relatedGuides: [
      { href: "/relocating/verify-employer-visa-job-offers", label: "Employer verification checklist" },
      { href: "/visa-sponsorship-jobs", label: "How we label sponsorship on jobs" },
      { href: partners, label: "Mobility partners" },
    ],
  },

  "verify-employer-visa-job-offers": {
    path: "/relocating/verify-employer-visa-job-offers",
    metaTitle: "How to verify an employer visa sponsor before you accept | Global Sponsor Hub",
    metaDescription:
      "Work abroad due diligence—confirm the company, role, contract, immigration route, timelines, and relocation benefits before you resign or book flights for an international job.",
    h1: "Verify an employer & visa job offer (checklist)",
    intro: `This guide is for **due diligence** before you accept and relocate—not for legal eligibility, which only an adviser or government can confirm.\n\nUse it to structure questions, documents, and independent checks so you don’t discover gaps after you’ve given notice or paid deposits.`,
    lastReviewed: STANDARD_LAST_REVIEWED,
    officialLinks: [
      { label: "USCIS — tools for understanding employer filings", href: "https://www.uscis.gov/" },
      { label: "IRCC — work in Canada programmes", href: "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html" },
      { label: "Australia Home Affairs", href: "https://immi.homeaffairs.gov.au/" },
    ],
    sections: [
      {
        h2: "Checklist roadmap (offer → resignation → arrival)",
        body: `1) Verify entity + recruiter identity.\n2) Lock immigration route nomenclature and who pays each fee.\n3) Model relocation cash flow with employer caps.\n4) Validate dependant sequencing.\n5) Only resign once written contingencies satisfy you.\n\n${CORRIDOR_HUB_NAV}\n\nEach hub surfaces typical vocabulary so you recognise when an employer’s wording matches—or contradicts—that corridor.`,
      },
      {
        h2: "Company & role reality checks",
        body: `Confirm the trading name, registration number, and office address match public records where available.\n\nValidate the hiring manager’s email domain and cross-link the job to an official careers posting.\n\nAsk which entity will employ you, where pay is sourced, and how probation works—especially if a “third-party” name appears on the contract.`,
      },
      {
        h2: "Immigration route & responsibilities",
        body: `Request **which visa/permit pathway** applies, who files what, typical stages, and whether dependants can be included in the plan.\n\nClarify whether sponsorship is contingent on probation, credentials recognition, salary bands, language tests, or medical checks.\n\nWrite down timelines: target start date vs realistic permit issuance.`,
      },
      {
        h2: "Money: salary, tax, relocation, repayment clauses",
        body: `Get compensation in writing: currency, gross vs net conventions, bonuses, allowances, equity, overtime rules.\n\nMap relocation: flights, temporary housing caps, shipments, schooling support—plus whether any **clawbacks** apply if you leave early.\n\nUnderstand who pays visa filing costs and what is taxable in the host country.`,
      },
      {
        h2: "How Global Sponsor Hub fits your search",
        body: `Listings advertise **Visa Sponsorship** and **Relocation Support** separately so you know what employers claim up front—but you should still reconcile those claims with your contract.\n\nFor services (lawyers, movers, tax), pair jobs with searches in our **partner directory**.`,
      },
    ],
    faqs: [
      {
        question: "Can I ask for references from other sponsored hires?",
        answer:
          "Many employers arrange blind references or introductions through HR once you reach late stage—it’s reasonable to ask after you receive a conditional offer.",
      },
      {
        question: "What if answers stay vague?",
        answer:
          "Treat vagueness as a signal to slow down until you obtain specifics in writing. High-quality mobility programmes usually have crisp answers.",
      },
    ],
    browseHref: "/companies-that-sponsor-visas",
    browseLabel: "Read sponsor‑friendly employer primer",
    breadcrumbs: bc({ name: "Verify employers & offers", path: "/relocating/verify-employer-visa-job-offers" }),
    relatedGuides: [
      { href: "/relocating/job-offers-scams-red-flags", label: "Scam red flags" },
      { href: JOBS_SPONSOR, label: "Sponsorship-labelled jobs" },
    ],
  },

  "cv-cover-letter-international-relocation-job": {
    path: "/relocating/cv-cover-letter-international-relocation-job",
    metaTitle: "CV & cover letter for international & relocation jobs | Global Sponsor Hub",
    metaDescription:
      "How to present sponsorship needs, quantify impact for global employers, and avoid ATS pitfalls when applying abroad.",
    h1: "CV & cover letter for relocation & visa sponsorship searches",
    intro: `Cross-border recruiters scan for signal fast: transferable impact, credibility, clarity on **timeline & work authorisation status**, and whether you understand the hiring market you’re entering.\n\nThese tips stay role-agnostic; pair them with corridor-specific norms from our **country hubs** and industry hubs on Global Sponsor Hub.`,
    lastReviewed: STANDARD_LAST_REVIEWED,
    sections: [
      {
        h2: "Tailoring tone to geography",
        body: `${CORRIDOR_HUB_NAV}\n\nCV etiquette shifts—photo norms, chronological vs competency layouts, referees volunteered upfront. Read postings in-market before mass-applying.`,
      },
      {
        h2: "Where to surface sponsorship needs (and where not to hide them)",
        body: `If you require sponsorship, mention it succinctly early—often a single clause in the summary or near your location line—rather than burying it in fine print.\n\nFrame it as logistical clarity: roles on our board already carry **benefit badges**; aligning your narrative reduces surprise later.\n\nAvoid long legal essays in a CV—save nuance for the cover letter or screening call.`,
      },
      {
        h2: "Impact bullets that travel across borders",
        body: `Use metrics understandable without local jargon: revenue, uptime, throughput, cohort sizes, cost savings.\n\nName tools and methodologies that global teams recognise.\n\nFor regulated professions, cite licence status and equivalency pathways if relevant (verify requirements per destination).`,
      },
      {
        h2: "Cover letter structure for relocation candidates",
        body: `Open with role & corridor: why this market, why now.\nExplain availability to interview across time zones and earliest realistic start anchored to visa timelines (high level).\nClose with curiosity about onboarding and mobility support—you’re evaluating them too.\n\nPair applications with postings tagged **Relocation Support** when you genuinely need logistical help.`,
      },
    ],
    faqs: [
      {
        question: "Should I include a photo on my CV?",
        answer:
          "Follow local norms: many English-speaking tech markets avoid photos; EU roles sometimes differ by country. Prefer plain ATS-friendly formatting unless the employer requests otherwise.",
      },
      {
        question: "How many pages?",
        answer:
          "Most early/mid-career profiles fit one to two concise pages—prioritise recent, relevant achievements.",
      },
    ],
    browseHref: JOBS_SPONSOR,
    browseLabel: "Apply to sponsorship-friendly roles",
    breadcrumbs: bc({ name: "CV & cover letters", path: "/relocating/cv-cover-letter-international-relocation-job" }),
    relatedGuides: [
      { href: "/relocating/interview-employer-relocation-visas-benefits", label: "Interview questions to ask" },
      { href: "/jobs/industry/software-engineering", label: "Example industry hub (SWE)" },
    ],
  },

  "interview-employer-relocation-visas-benefits": {
    path: "/relocating/interview-employer-relocation-visas-benefits",
    metaTitle: "Interview questions on visas, sponsorship & relocation | Global Sponsor Hub",
    metaDescription:
      "Neutral, constructive questions about work authorisation timelines, dependents, probation, reimbursement, schooling, flights, and onboarding—without derailing interviews.",
    h1: "Ask employers about visas, sponsorship & relocation (constructively)",
    intro: `You’re allowed to diligence employers the way they diligence you—especially across borders.\n\nAim for **neutral, factual** questions that reveal process maturity rather than signalling anxiety. Adapt wording to seniority and stage (screening vs final).`,
    lastReviewed: STANDARD_LAST_REVIEWED,
    sections: [
      {
        h2: "Why corridors change the visa answers you hear",
        body: `${CORRIDOR_HUB_NAV}\n\nAsk employers which government portal nomenclature they file under—you’ll quickly spot improvisation vs repeatable programmes.`,
      },
      {
        h2: "Visa / work authorisation sequencing",
        body: `Which permit route applies to this role and who submits each step?\nWhat milestones block the start date (credentials, police certificates, medicals)?\nHow have recent hires in similar profiles timed entry?\n\nKeep notes—compare answers to official processing guidance later with an adviser.`,
      },
      {
        h2: "Probation, contract, and clawbacks",
        body: `Is sponsorship tied to passing probation?\nAre there repayment clauses for visa or relocation costs if you leave early?\nHow is notice period structured across jurisdictions?`,
      },
      {
        h2: "Relocation benefits (money, housing, schooling, pets)",
        body: `Which items are **allowances vs invoiced/reimbursed**—and in what currency?\nIs temporary housing capped by nights or budget?\nFor families: school search support, timeline for dependant filings, spouse work permission if applicable.\n\nCross-check with filters for **Relocation Support** on job pages.`,
      },
      {
        h2: "Onboarding & first 90 days",
        body: `Ask about equipment shipping, tax orientation, community buddy programmes, and escalation contacts for immigration counsel.\n\nStrong programmes usually have crisp answers and written summaries.`,
      },
    ],
    faqs: [
      {
        question: "When should I avoid leading with visa questions?",
        answer:
          "Early screens often focus on skills fit—introduce logistics once mutual interest is clear, then deepen in a dedicated HR/mobility call.",
      },
      {
        question: "What if the employer cannot answer basics?",
        answer:
          "Internally small teams may route you to external counsel—ask who coordinates filings and how you’ll stay unblocked.",
      },
    ],
    browseHref: JOBS_RELOC,
    browseLabel: "Browse roles with relocation support",
    breadcrumbs: bc({ name: "Interview & benefits", path: "/relocating/interview-employer-relocation-visas-benefits" }),
    relatedGuides: [
      { href: "/relocating/verify-employer-visa-job-offers", label: "Offer verification checklist" },
      { href: "/jobs-with-relocation-support", label: "Relocation support jobs primer" },
    ],
  },

  "moving-country-relocation-first-90-days": {
    path: "/relocating/moving-country-relocation-first-90-days",
    metaTitle: "First 90 days after a job-sponsored move: checklist | Global Sponsor Hub",
    metaDescription:
      "Landing tasks: housing handover, registrations, banking, tax IDs, schooling, commute, probation goals—without drowning in spreadsheets.",
    h1: "Your first 90 days in a new country (relocation checklist)",
    intro: `Every corridor differs—visa conversions, commune registrations, biometric cards—but the **shape** of onboarding is predictable: stabilise shelter, bureaucratic IDs, payroll, healthcare, commuting, social roots, then performance.\n\nUse this as a modular checklist; pair with partners in our **directory** for hands-on execution.`,
    lastReviewed: STANDARD_LAST_REVIEWED,
    sections: [
      {
        h2: "Adapt this checklist locally",
        body: `${CORRIDOR_HUB_NAV}\n\nSome countries register you at municipalities, others stamp residence cards at airports—use the hub narratives to reorder weeks below appropriately.`,
      },
      {
        h2: "Week 0–2: arrive, sleep, identify blockers",
        body: `Confirm temporary housing handover, SIM, transport from airport, lockbox access.\n\nComplete any **in-country registration** steps your visa requires (appointments book out—schedule early).\nOpen basic banking if needed for deposits and payroll.\n\nBook a calibration meeting with HR + immigration counsel timelines.`,
      },
      {
        h2: "Week 3–8: bureaucracy & benefits",
        body: `Tax identifiers, pensions opt-ins/opt-outs where relevant, probation metrics, tooling access.\n\nHealthcare: enrol dependents, dentists, vaccinations required for schooling.\n\nSchooling: placements, uniforms, commute patterns—coordinate with relocation agency if bundled.`,
      },
      {
        h2: "Week 9–12: rhythm & advocacy",
        body: `Stabilise commute; join one community anchor (sport, volunteer, coworking).\n\nDocument wins for probation; surface blockers early with your manager.\n\nIf relocating with a partner, align two household calendars—burnout is a leading cause of failed moves.`,
      },
    ],
    faqs: [
      {
        question: "What if my visa requires conversion within a fixed window?",
        answer:
          "Treat that as a hard deadline with buffer—book appointments before you fly when possible, and keep counsel on speed-dial for reschedules.",
      },
      {
        question: "Where do I find local experts quickly?",
        answer:
          "Use our partner directory filtered by country/service, and cross-check credentials independently.",
      },
    ],
    browseHref: partners,
    browseLabel: "Find relocation & immigration partners",
    breadcrumbs: bc({ name: "First 90 days", path: "/relocating/moving-country-relocation-first-90-days" }),
    relatedGuides: [
      { href: "/relocating/relocating-move-budget-financial-checklist", label: "Move budget checklist" },
      { href: "/global-relocation-directory", label: "Relocation directory primer" },
    ],
  },

  "relocating-family-visas-move-with-job": {
    path: "/relocating/relocating-family-visas-move-with-job",
    metaTitle: "Moving abroad with partner & children on a sponsored job | Global Sponsor Hub",
    metaDescription:
      "Planning points for dependents: schooling timelines, spouse work permission, passports, vaccinations, shipment phasing—not legal advice.",
    h1: "Relocating with family when you accept a sponsored job abroad",
    intro: `Family moves amplify complexity: passports, schooling cut‑offs, double housing costs, trailing careers, elder care spans, pet transport.\n\nThis page frames **planning dimensions** you should discuss with employers and specialist partners—then confirm rules with official sources for your visa class.`,
    lastReviewed: STANDARD_LAST_REVIEWED,
    sections: [
      {
        h2: "Corridor differences that hit families hardest",
        body: `${CORRIDOR_HUB_NAV}\n\nSchool term calendars, bilingual tracks, childcare subsidies, trailing partner work eligibility, housing deposit multiples—these swing wider than headline salary.`,
      },
      {
        h2: "Dependant eligibility & sequencing",
        body: `Ask whether your intended visa class allows immediate dependant filings, staggered entries, or age limits for children.\n\nClarify whether the employer’s counsel supports family filings or if you must retain separate representation.\n\nCollect document lists early: marriage certificates, birth certificates, custody orders—often require certified translations.`,
      },
      {
        h2: "Schooling & childcare",
        body: `Research term dates and catchment rules before you pick suburbs.\n\nBudget for international school deposits vs state options; waitlists can span terms.\n\nCoordinate temporary housing near staging schools if needed.`,
      },
      {
        h2: "Partner careers & community",
        body: `Discuss realistic timelines for a partner’s work authorisation where applicable.\n\nPlan at least one non-work anchor in the first 60 days to reduce isolation risk.\n\nEmployers offering **relocation support** may include career coaching—check posting labels.`,
      },
    ],
    faqs: [
      {
        question: "Should children travel before permits finalise?",
        answer:
          "Policies differ by route and age—follow counsel and never assume tourist entry covers school attendance rights.",
      },
      {
        question: "What if my partner needs credential recognition?",
        answer:
          "Start early: regulated careers may need months of paperwork separate from your own employment permit.",
      },
    ],
    browseHref: JOBS_RELOC,
    browseLabel: "Roles that flag relocation support",
    breadcrumbs: bc({ name: "Family & dependants", path: "/relocating/relocating-family-visas-move-with-job" }),
    relatedGuides: [
      { href: "/relocating/moving-country-relocation-first-90-days", label: "First 90 days checklist" },
      { href: partners, label: "Partner directory" },
    ],
  },

  "relocating-move-budget-financial-checklist": {
    path: "/relocating/relocating-move-budget-financial-checklist",
    metaTitle: "Relocation budget & money checklist for international moves | Global Sponsor Hub",
    metaDescription:
      "Cashflow planning: deposits, double rent, flights, shipments, tax surprises, FX, emergency buffer—before you accept a global offer.",
    h1: "Relocation money plan (budget checklist)",
    intro: `Even strong offers fail if cashflow breaks during the **double-cost window** (old home + new deposit) or if tax surprises hit your first payslip.\n\nBuild a simple ledger; adjust numbers to your corridor with local advice.`,
    lastReviewed: STANDARD_LAST_REVIEWED,
    officialLinks: [
      { label: "OECD — taxation primers", href: "https://www.oecd.org/topics/taxation/" },
      { label: "IRS — international taxpayers (orientation)", href: "https://www.irs.gov/individuals/international-taxpayers" },
    ],
    sections: [
      {
        h2: "Why you should localise budgets per hub",
        body: `${CORRIDOR_HUB_NAV}\n\nRent deposits, commuter pass pricing, withholding conventions, schooling fees, VAT vs sales tax quirks—model using local sources after this framework.`,
      },
      {
        h2: "One-off costs to model",
        body: `Flights, excess baggage, pet transport, visa filing & medicals, certified translations, temporary housing, household shipment, furniture repurchase, school deposits, vehicle changes, breaking old leases.\n\nMark which lines the employer reimburses—and whether reimbursement is taxable.`,
      },
      {
        h2: "Monthly delta after arrival",
        body: `Rent vs prior market, commuter passes, childcare, insurance gaps before state coverage activates, colder climate wardrobe, schooling fees.\n\nModel **three scenarios**: lean, realistic, stretched with FX moves.`,
      },
      {
        h2: "Buffers & behavioural guardrails",
        body: `Keep an emergency runway beyond “first paycheck”—permits slip, probation exists, winters cost more.\n\nAutomate reminders for council tax equivalents, renewal fees, pension choices during eligibility windows.`,
      },
    ],
    faqs: [
      {
        question: "Who can help sanity-check tax outcomes?",
        answer:
          "Cross-border accountants often pair with mobility teams—search our partner directory and verify regulatory status.",
      },
      {
        question: "Should I negotiate reimbursement caps?",
        answer:
          "Yes—relocating hires commonly negotiate allowances or direct billing for housing and shipments when policy allows.",
      },
    ],
    browseHref: "/international-jobs-visa-sponsorship",
    browseLabel: "Compare corridors (high-level)",
    breadcrumbs: bc({ name: "Move budget", path: "/relocating/relocating-move-budget-financial-checklist" }),
    relatedGuides: [
      { href: "/relocating/interview-employer-relocation-visas-benefits", label: "Ask about allowances" },
      { href: "/jobs-with-relocation-support", label: "Jobs with relocation tags" },
    ],
  },

  "regulated-jobs-credentials-recognition-abroad": {
    path: "/relocating/regulated-jobs-credentials-recognition-abroad",
    metaTitle: "Regulated professions: credential recognition abroad | Global Sponsor Hub",
    metaDescription:
      "Planning angle for nurses, teachers, clinicians, accountants, pilots, engineers: licences, equivalency exams, bridging programmes—paired with corridor research.",
    h1: "Regulated professions & credential recognition (relocation primer)",
    intro: `Some careers require **government or regulator recognition** before you can practise—even if your employer sponsors you.\n\nThis hub orients planners; it doesn’t describe every board’s rules.`,
    lastReviewed: STANDARD_LAST_REVIEWED,
    sections: [
      {
        h2: "Start from the corridor regulator",
        body: `${CORRIDOR_HUB_NAV}\n\nEach regulator publishes bridging programmes, exams, timelines, languages—gather those PDFs alongside immigration paperwork.`,
      },
      {
        h2: "Why sponsorship ≠ automatic licence-to-practise",
        body: `Work permits approve employment in principle; regulators may separately require examinations, supervised hours, language bars, malpractice cover, or “adaptation periods.”\n\nFailure to sequence these risks delayed start dates or reworked contracts.`,
      },
      {
        h2: "Typical artefacts to gather early",
        body: `Diploma transcripts, licensing exam history, practice logs, good-standing letters, malpractice history where applicable.\n\nExpect certified translations—not machine PDFs.`,
      },
      {
        h2: "Pair research with hubs on Global Sponsor Hub",
        body: `Open **country** and **industry** hubs—for example nurses may align with healthcare shortage narratives but still owe local board steps.\n\nUse postings to gauge employer willingness to sponsor training or bridging.`,
      },
    ],
    faqs: [
      {
        question: "Where do I verify official pathways?",
        answer:
          "Always confirm with your destination regulator or ministry site; pair with authorised immigration counsel for sequencing.",
      },
      {
        question: "Does Global Sponsor Hub verify credentials?",
        answer:
          "No—employers evaluate fit; regulators evaluate licensure.",
      },
    ],
    browseHref: "/jobs",
    browseLabel: "Search regulated roles by sector",
    breadcrumbs: bc({ name: "Regulated careers", path: "/relocating/regulated-jobs-credentials-recognition-abroad" }),
    relatedGuides: [
      { href: "/relocating/cv-cover-letter-international-relocation-job", label: "CV framing" },
      { href: "/jobs/industry/nursing", label: "Nursing hub example" },
    ],
  },
};

export const RELOCATION_GUIDE_SLUGS = Object.keys(RELOCATION_GUIDE_PAGES);

export function getRelocationGuide(slug: string): SeoPillarPageConfig | undefined {
  return RELOCATION_GUIDE_PAGES[slug];
}

export const ALL_RELOCATION_GUIDE_PAGES: SeoPillarPageConfig[] = RELOCATION_GUIDE_SLUGS.map(
  (s) => RELOCATION_GUIDE_PAGES[s],
);
