import { countryDisplayName } from "@/lib/countries";
import { RELOCATION_SERVICE_LABELS } from "@/lib/relocationServices";
import { useAppLanguage, toIntlLocale } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
const labels: Record<string, string> = {
  planning: "Exploring my options",
  moving_without_job: "Moving without a job",
  application: "Applying for jobs",
  interview: "Interviewing",
  offer: "I have a job offer",
  hired: "I have accepted a job",
  relocating: "I am moving",
  within_30_days: "Within 30 days",
  within_90_days: "Within 90 days",
  within_6_months: "Within 6 months",
  later: "Later",
  unknown: "Not sure yet",
  submitted: "Submitted",
  matching: "Finding specialists",
  matched: "Specialists found",
  withdrawn: "Withdrawn",
  closed: "Closed",
};
export function useRequestLabels() {
  const ac = useAccountCopy();
  const locale = useAppLanguage((s) => s.locale);
  const intlLocale = toIntlLocale(locale);
  return {
    locale: intlLocale,
    label: (value: string) =>
      ac(labels[value] || RELOCATION_SERVICE_LABELS[value] || "Unavailable"),
    country: (code: string) => countryDisplayName(code, locale),
  };
}
