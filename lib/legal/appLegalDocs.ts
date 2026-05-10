/** Mirrors global_sponsor_hub-fe legal pages (same last updated). Bundled for offline/in-app reading — sync when policies change on web. */
export const LEGAL_LAST_UPDATED = "8 May 2026";

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocDef = {
  title: string;
  subtitle?: string;
  sections: LegalSection[];
};

export type LegalDocId = "privacy-policy" | "terms-and-conditions" | "cookie-policy" | "acceptable-use";

export const LEGAL_DOCUMENTS: Record<LegalDocId, LegalDocDef> = {
  "privacy-policy": {
    title: "Privacy Policy",
    subtitle: `Last updated: ${LEGAL_LAST_UPDATED}`,
    sections: [
      {
        heading: "Full Legal Privacy Policy",
        paragraphs: ["Global Sponsor Hub (“we,” “our,” “us”) respects your privacy."],
      },
      {
        heading: "1. Introduction",
        paragraphs: [
          "This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.",
          "We operate globally, but our primary base is in the United Kingdom, and we comply with the UK GDPR, Data Protection Act 2018, and EU GDPR where applicable.",
        ],
      },
      {
        heading: "2. Information We Collect",
        bullets: [
          "Candidates: name and contact details; location; CV/resume and profile; job application history; account settings and preferences.",
          "Employers: company details; contact person information; job listing content; payment and subscription details.",
          "Partners: business details; service descriptions; contact information; payment and subscription details.",
          "Automatically collected: IP address, browser/app type, and device information; usage patterns and analytics where permitted; cookie and privacy preferences.",
          "Cookies: described further in the Cookie Policy inside this app.",
          "If you use our chat assistant on the web, messages may be processed by third‑party AI to generate replies. Do not send passwords, card numbers, or government ID numbers in chat.",
          "We may use services such as Sentry for crash diagnostics when configured.",
        ],
      },
      {
        heading: "3. How We Use Your Information",
        bullets: [
          "Operate and improve the platform",
          "Show relevant jobs, partners, and resources",
          "Facilitate direct contact between candidates, employers, and partners",
          "Process subscription payments",
          "Maintain security",
          "Meet legal obligations",
        ],
      },
      {
        heading: "4. Who Can See Your Information",
        bullets: [
          "Employers can view your CV if you applied to their job or opted into CV search.",
          "Partners see contact details you share via the partner directory.",
          "Other users cannot see private account data unless you choose to share it.",
          "We do not sell or rent your personal data.",
        ],
      },
      {
        heading: "5. Global Users & International Data Transfers",
        paragraphs: [
          "We process and store data in various locations and use safeguards such as Standard Contractual Clauses, encryption, and secure hosting.",
        ],
      },
      {
        heading: "6. Data Retention",
        paragraphs: [
          "We keep information only as long as needed to provide services or meet legal requirements. You can request deletion of your account (Settings → Delete account in this app when signed in).",
          "Operational backups may retain limited snapshots for a fixed window for support and disputes; live systems are prioritised for erasure requests.",
          "Read notifications may expire automatically after a retention window.",
        ],
      },
      {
        heading: "7. Your Rights",
        bullets: [
          "Access, correction, deletion, restriction/objection, and portability where applicable.",
          "Contact support@globalsponsorhub.com to exercise rights.",
        ],
      },
      {
        heading: "8. Security Measures",
        paragraphs: ["We use encryption, secure payments, and restricted access controls."],
      },
      {
        heading: "9. Changes to This Policy",
        paragraphs: ["We may update this policy. Material updates will be reflected here with a revised last updated date."],
      },
      {
        heading: "10. Contact Us",
        paragraphs: ["support@globalsponsorhub.com"],
      },
    ],
  },
  "terms-and-conditions": {
    title: "Terms & Conditions",
    subtitle: `Last updated: ${LEGAL_LAST_UPDATED}`,
    sections: [
      {
        heading: "1. Introduction",
        paragraphs: [
          "Global Sponsor Hub is a global job and relocation advertising platform operated from the United Kingdom.",
          "We are not a recruitment agency and do not vet candidates, employers, or partners. Connections are direct between parties.",
          "By using the platform you agree to these Terms. If you disagree, stop using the services.",
        ],
      },
      {
        heading: "2. Global Services & International Users",
        paragraphs: [
          "We welcome international users. Core operations are UK‑based; data may be processed globally under UK GDPR / EU GDPR where applicable.",
          "You must comply with laws in your jurisdiction.",
        ],
      },
      {
        heading: "3. How the Platform Works",
        bullets: [
          "Candidates browse jobs, apply to employers, and contact partners directly.",
          "Employers post labelled roles and may search opted‑in CVs.",
          "Partners list directory services and receive direct enquiries.",
          "External curated listings link to third‑party application flows — we are not the recruiter there.",
        ],
      },
      {
        heading: "4. Sustainability Commitment",
        paragraphs: ["Tree planting partnership applies per published sustainability rules."],
      },
      {
        heading: "5. Accounts & Access",
        bullets: [
          "You must be at least 18.",
          "Keep credentials secure; provide accurate information; don’t share accounts.",
        ],
      },
      {
        heading: "6. Payments & Subscriptions",
        bullets: [
          "Candidate accounts are free.",
          "Employer/partner subscriptions renew per checkout terms.",
        ],
      },
      {
        heading: "7. Content & Responsibility",
        bullets: [
          "Users are responsible for lawful, accurate listings.",
          "We may remove content that breaches these Terms.",
        ],
      },
      {
        heading: "8. Prohibited Use",
        bullets: ["No misleading listings", "No harassment/spam using harvested contacts", "No malware or disruption"],
      },
      {
        heading: "9. Disclaimers & Limitation of Liability",
        paragraphs: [
          'Services are provided “as is”. We are not party to hiring contracts between users.',
        ],
      },
      {
        heading: "10. Governing Law",
        paragraphs: ["Governed by the laws of England and Wales."],
      },
      {
        heading: "11. Contact Us",
        paragraphs: ["support@globalsponsorhub.com"],
      },
    ],
  },
  "cookie-policy": {
    title: "Cookie Policy",
    subtitle: `Last updated: ${LEGAL_LAST_UPDATED}`,
    sections: [
      {
        heading: "1. Introduction",
        paragraphs: [
          "Explains cookies on our website and platform. Essential cookies keep accounts working; analytics/marketing cookies depend on consent choices on web.",
          "This native app does not use browser cookies; comparable identifiers may still apply to signed‑in API sessions as described in the Privacy Policy.",
        ],
      },
      {
        heading: "2. What Are Cookies?",
        paragraphs: [
          "Cookies are small files stored on devices when visiting websites to remember preferences and sessions.",
        ],
      },
      {
        heading: "3. Types of Cookies We Use",
        bullets: [
          "Essential: login and security.",
          "Analytics & measurement (non‑essential on web): examples include Google Tag Manager / GA4 and LinkedIn Insight when accepted.",
          "Product analytics on web when signed in may include Vercel Web Analytics and PostHog — refer to website banner choices.",
          "Preference cookies remember language/display choices.",
        ],
      },
      {
        heading: "4. How We Use Cookies",
        bullets: ["Maintain sessions", "Improve security", "Measure usage", "Store preferences"],
      },
      {
        heading: "5. Third‑Party Cookies",
        paragraphs: ["Third‑party tools set their own cookies per their policies."],
      },
      {
        heading: "6. Controlling Cookies",
        bullets: ["Use the web consent banner", "Adjust browser settings", "Disable analytics where offered"],
      },
      {
        heading: "7. Changes & Contact",
        paragraphs: ["We may update this policy.", "support@globalsponsorhub.com"],
      },
    ],
  },
  "acceptable-use": {
    title: "Acceptable Use Policy",
    subtitle: `Last updated: ${LEGAL_LAST_UPDATED} · Supplements Terms & Conditions`,
    sections: [
      {
        heading: "1. Be honest and lawful",
        paragraphs: [
          "Do not post false or deceptive listings. Do not impersonate others. Comply with employment, immigration, and discrimination laws applicable to you.",
        ],
      },
      {
        heading: "2. Respect other users",
        paragraphs: ["No harassment, hate speech, threats, or spam. Report concerns to support@globalsponsorhub.com."],
      },
      {
        heading: "3. No abuse of the platform",
        paragraphs: [
          "No scraping/overloading, malware uploads, or bypassing access controls. Do not misuse AI assistants to spam or probe systems.",
        ],
      },
      {
        heading: "4. Immigration and legal advice",
        paragraphs: ["We are a marketplace/software platform — not a law firm or immigration adviser."],
      },
      {
        heading: "5. Enforcement",
        paragraphs: ["We may suspend accounts or remove content that violates this policy or the Terms."],
      },
    ],
  },
};
