/**
 * Short in-app summaries keyed by website path (same URLs as global_sponsor_hub-fe seo pillar guides).
 * Full articles (many sections, tables, links) live on the website — users reach them via “Read full guide on website”.
 */
export type GuideTopicStub = {
  title: string;
  intro: string;
  bullets: string[];
};

export const GUIDE_TOPIC_STUBS: Record<string, GuideTopicStub> = {
  "/visa-sponsorship-jobs": {
    title: "Visa sponsorship jobs",
    intro:
      "Employers who sponsor work visas label mobility clearly in postings. Use sponsorship signals as a first filter — then confirm role fit and timelines.",
    bullets: [
      "Prefer listings that state sponsorship or relocation plainly in the description.",
      "Salary and occupation lists change — verify thresholds against official immigration sources.",
      "Use this app’s Jobs tab and alerts so your search stays inside one signed-in experience.",
    ],
  },
  "/international-jobs-visa-sponsorship": {
    title: "International jobs & visas",
    intro:
      "Country corridors differ: eligibility, salary benchmarks, and sponsor behaviour all vary. Treat web research as orientation, not approval.",
    bullets: [
      "Compare destinations using country guides in this hub before you apply widely.",
      "Ask employers early about sponsor licence status and realistic CoS / permit timing.",
      "Cross-check every claim on official government immigration pages.",
    ],
  },
  "/jobs-with-relocation-support": {
    title: "Relocation support roles",
    intro:
      "Relocation packages range from cash stipends to vendors handling flights and temporary housing. Read what is actually promised before accepting.",
    bullets: [
      "Separate visa sponsorship from relocation allowances — they are not the same.",
      "Clarify tax treatment, clawbacks, and probation ties to relocation benefits.",
      "Partner directory lists mobility specialists if you need execution help beyond HR.",
    ],
  },
  "/global-relocation-directory": {
    title: "Relocation partner directory hub",
    intro:
      "Specialists help with legal filings, tax, shipping, schooling, and arrivals. Choose providers after you understand your own gaps.",
    bullets: [
      "Open the in-app Partner directory to browse categories without leaving your session.",
      "Verify regulated credentials before paying retainers.",
      "Keep evidence trails for employer-sponsored versus self-paid services.",
    ],
  },
  "/companies-that-sponsor-visas": {
    title: "Sponsor-friendly employers",
    intro:
      "Some employers routinely hire internationally; others trial one corridor. Evidence beats brand reputation.",
    bullets: [
      "Look for repeat sponsorship hiring patterns and clear mobility language in listings.",
      "Research licence registers where governments publish sponsor lists.",
      "Combine employer diligence with the relocating guides in this hub.",
    ],
  },
  "/employers/corporate-global-mobility": {
    title: "Employer mobility playbook",
    intro:
      "If you negotiate with employers, understanding how mobility teams think helps you ask better questions — without replacing legal counsel.",
    bullets: [
      "Ask how visa workflow is owned: in-house, law firm, or hybrid.",
      "Clarify who pays which fees and what happens if start dates slip.",
      "Candidates still validate personal eligibility independently.",
    ],
  },
  "/partners/directory": {
    title: "Partner directory",
    intro: "Browse relocation, legal, and mobility partners without opening the public site.",
    bullets: [
      "Use filters conceptually: pick categories matching your bottleneck.",
      "Shortlist providers; confirm engagement terms directly.",
      "Return here anytime from Guides → Partner shortcuts.",
    ],
  },
  "/relocating/job-offers-scams-red-flags": {
    title: "Scams & bogus job-offer red flags",
    intro: "Fraud spikes around international hiring. Slow down when money, urgency, or secrecy appears.",
    bullets: [
      "Legitimate employers rarely ask candidates to pay visa fees upfront via wire to individuals.",
      "Verify domains, recruiter identities, and written offers through official channels.",
      "If unsure, pause — ask our team via Feedback and compare against official employer careers pages.",
    ],
  },
  "/relocating/verify-employer-visa-job-offers": {
    title: "Verify employers & written offers",
    intro: "Written offers should align with visa routes and payroll reality. Verbal promises are not filing evidence.",
    bullets: [
      "Match job title, salary, and location to what sponsorship filings require.",
      "Ask for sponsor licence references where public registers exist.",
      "Keep contemporaneous notes of who promised what and when.",
    ],
  },
  "/relocating/cv-cover-letter-international-relocation-job": {
    title: "CV & cover letter for abroad",
    intro: "International recruiters skim for mobility clarity and measurable outcomes.",
    bullets: [
      "State work authorization needs honestly but succinctly.",
      "Quantify impact; avoid dense walls of buzzwords.",
      "Use the Career toolkit ATS assistant for keyword alignment.",
    ],
  },
  "/relocating/interview-employer-relocation-visas-benefits": {
    title: "Interview: visas & relocation benefits",
    intro: "Ask structured questions without sounding adversarial — you are de-risking the move.",
    bullets: [
      "Timeline: hiring decision → offer → filing → entry/start date.",
      "Costs: who pays filing, dependents, flights, temporary housing?",
      "Role protections if permits delay — remote start vs revised start.",
    ],
  },
  "/relocating/moving-country-relocation-first-90-days": {
    title: "First 90 days in a new country",
    intro: "Early wins are registrations, banking readiness, and predictable commuting — stress compounds mistakes.",
    bullets: [
      "Sequence tax IDs, phone, and address proofs based on local order.",
      "Budget reserves beyond employer allowances.",
      "Lean on partners only where DIY genuinely risks compliance.",
    ],
  },
  "/relocating/relocating-family-visas-move-with-job": {
    title: "Moving with partner & children",
    intro: "Dependant timelines sometimes lag primary visas — plan schooling and spousal work permission deliberately.",
    bullets: [
      "Ask employers how dependant filings are coordinated.",
      "Research school admissions windows before accepting dates.",
      "Budget interim housing sized for the whole household.",
    ],
  },
  "/relocating/relocating-move-budget-financial-checklist": {
    title: "Move budget & money checklist",
    intro: "Cash-flow shocks hurt more than headline salary — map gross vs net and relocation spikes.",
    bullets: [
      "Include deposits, shipping, insurance gaps, and emergency reserves.",
      "Model currency moves if salaries split jurisdictions.",
      "Clawbacks on relocation spend — understand triggers.",
    ],
  },
  "/relocating/regulated-jobs-credentials-recognition-abroad": {
    title: "Regulated careers & licences abroad",
    intro: "Healthcare, legal, teaching, and engineering often need recognition beyond a visa.",
    bullets: [
      "Start credential evaluation early — it can gate both hiring and filing.",
      "Employers may sponsor only after recognition milestones — clarify sequencing.",
      "Use specialists where regulators publish explicit pathways.",
    ],
  },
};

export function getGuideTopicStub(href: string): GuideTopicStub | undefined {
  const key = href.trim().split("#")[0].split("?")[0];
  return GUIDE_TOPIC_STUBS[key];
}
