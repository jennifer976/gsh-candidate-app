export type CvQualitySeverity = "pass" | "warn" | "fail";

export type CvQualityCheck = {
  id: string;
  severity: CvQualitySeverity;
  message: string;
};

export type CvQualityResult = {
  score: number;
  wordCount: number;
  checks: CvQualityCheck[];
};

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_RE =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,6}\b/;
const LINKEDIN_RE = /linkedin\.com\/(in|pub)\//i;
const YEAR_RANGE_RE =
  /\b(?:19|20)\d{2}\s*[–—-]\s*(?:(?:19|20)\d{2}|present|current|now)\b/i;

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function bulletCount(text: string) {
  return text
    .split("\n")
    .filter((line) => /^\s*([•\-*▪·]|\d+[.)])\s+\S/.test(line)).length;
}

export function analyzeCvQuality(raw: string): CvQualityResult {
  const text = raw.replace(/\r\n/g, "\n").trim();
  const lower = text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const checks: CvQualityCheck[] = [];
  const add = (
    id: string,
    severity: CvQualitySeverity,
    message: string,
  ) => checks.push({ id, severity, message });

  if (wordCount < 80) add("length", "fail", "Add more detail; this CV is very short.");
  else if (wordCount < 160)
    add("length", "warn", "Consider adding more evidence and role detail.");
  else add("length", "pass", "The CV has enough text for a useful review.");

  if (wordCount > 2200)
    add("long", "warn", "The CV is long; remove repetition and low-value detail.");

  add(
    "email",
    EMAIL_RE.test(text) ? "pass" : "fail",
    EMAIL_RE.test(text)
      ? "A contact email is present."
      : "Add a professional contact email.",
  );
  add(
    "phone",
    PHONE_RE.test(text) || /\bwhatsapp\b/i.test(text) ? "pass" : "warn",
    PHONE_RE.test(text) || /\bwhatsapp\b/i.test(text)
      ? "A phone or WhatsApp contact is present."
      : "Consider adding a phone or WhatsApp contact.",
  );
  add(
    "linkedin",
    LINKEDIN_RE.test(text) ? "pass" : "warn",
    LINKEDIN_RE.test(text)
      ? "A LinkedIn profile is present."
      : "Consider adding a LinkedIn profile.",
  );

  const sections = [
    {
      id: "experience",
      terms: ["experience", "employment", "work history", "career"],
      present: "Work experience is clearly signposted.",
      missing: "Add a clear work experience section.",
    },
    {
      id: "education",
      terms: ["education", "university", "degree", "qualification"],
      present: "Education or qualifications are clearly signposted.",
      missing: "Add a clear education or qualifications section.",
    },
    {
      id: "skills",
      terms: ["skills", "competencies", "technical skills", "tooling", "stack"],
      present: "Skills are clearly signposted.",
      missing: "Add a concise skills section.",
    },
  ];
  sections.forEach((section) => {
    const present = hasAny(lower, section.terms);
    add(section.id, present ? "pass" : "warn", present ? section.present : section.missing);
  });

  const bullets = bulletCount(text);
  add(
    "bullets",
    bullets >= 4 ? "pass" : "warn",
    bullets >= 4
      ? "Bullet points make achievements easy to scan."
      : "Use more bullet points for responsibilities and achievements.",
  );

  const measurable =
    /\d+\s*%/.test(text) ||
    /[£€$]\s?\d/.test(text) ||
    /\b\d[\d,]*\s*(k|m|million|billion)\b/i.test(text);
  add(
    "metrics",
    measurable ? "pass" : "warn",
    measurable
      ? "Measurable results are included."
      : "Add numbers, scale, or outcomes where possible.",
  );
  add(
    "dates",
    YEAR_RANGE_RE.test(lower) ? "pass" : "warn",
    YEAR_RANGE_RE.test(lower)
      ? "Employment date ranges are present."
      : "Use consistent date ranges for roles.",
  );

  const weights = { pass: 100, warn: 65, fail: 35 } as const;
  const score = Math.round(
    checks.reduce((total, check) => total + weights[check.severity], 0) /
      checks.length,
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    wordCount,
    checks,
  };
}
