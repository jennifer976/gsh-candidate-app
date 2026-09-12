import { appCopy, type AppCopyKey, type AppLanguage } from "@/lib/i18n/catalog";

const labels: Record<string, AppCopyKey> = {
  "/jobs": "homeFind",
  "/specialists": "guideFindSpecialists",
  "/companies": "guideExploreEmployers",
  "/resources/job-offer-scam-checklist": "guideCheckOffer",
  "/resources/employer-verification-email-template": "guideEmployerQuestions",
  "/resources/visa-sponsorship-cover-letter-template": "guideCoverLetter",
  "/resources/first-90-days-relocation-checklist": "guide90Days",
  "/resources/relocation-budget-checklist": "guideBudget",
};

export function guideLinkLabel(
  href: string,
  fallback: string,
  locale: AppLanguage,
): string {
  const key = labels[href];
  return key ? appCopy(locale, key) : fallback;
}
