import { useAppCopy } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { fetchRelocationPerks } from "@/lib/api-client";

export const RELOCATION_PERKS_QUERY_KEY = [
  "relocation-perks",
  "candidate",
] as const;

export const RELOCATION_PERKS_FALLBACK_TITLE = "Relocation perks";
export const RELOCATION_PERKS_FALLBACK_SUBTITLE =
  "External offers and services for your move. Provider terms apply.";

/** Admin-configured section title/subtitle (same API as the perks screen). */
export function useRelocationPerksNav() {
  const { t, locale } = useAppCopy();
  const { data } = useQuery({
    queryKey: [...RELOCATION_PERKS_QUERY_KEY],
    queryFn: () => fetchRelocationPerks("candidate"),
    staleTime: 5 * 60 * 1000,
  });

  return {
    title:
      (locale === "en" ? data?.title?.trim() : undefined) ||
      t("resourcesPerks"),
    subtitle:
      (locale === "en" ? data?.subtitle?.trim() : undefined) ||
      t("resourcesPerksHelp"),
  };
}
