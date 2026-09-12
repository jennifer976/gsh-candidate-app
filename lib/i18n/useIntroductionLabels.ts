import { useAccountCopy } from "./useAccountCopy";
import { useRequestLabels } from "./useRequestLabels";
const statuses: Record<string, string> = {
  proposed: "Proposed", consent_pending: "Awaiting your response", consented: "Accepted",
  introduced: "Introduced", declined: "Declined", withdrawn: "Withdrawn", closed: "Closed",
};
const experience: Record<string, string> = {
  entry: "Entry level", mid: "Mid-level", senior: "Senior", lead: "Team lead", executive: "Executive",
};
export function useIntroductionLabels() {
  const ac = useAccountCopy();
  const { locale, country } = useRequestLabels();
  return {
    ac, country,
    status: (value: string) => ac(statuses[value] || "Status unavailable"),
    experience: (value: string | null) => ac(experience[value || ""] || "Experience not specified"),
    date: (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)),
  };
}
