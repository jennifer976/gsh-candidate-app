import { useQuery } from "@tanstack/react-query";
import { fetchRelocationPerks } from "@/lib/api-client";

export const RELOCATION_PERKS_QUERY_KEY = ["relocation-perks", "candidate"] as const;

export const RELOCATION_PERKS_FALLBACK_TITLE = "Relocation perks";
export const RELOCATION_PERKS_FALLBACK_SUBTITLE =
  "Discounts and trusted services to help you move for work.";

/** Admin-configured section title/subtitle (same API as the perks screen). */
export function useRelocationPerksNav() {
  const { data } = useQuery({
    queryKey: [...RELOCATION_PERKS_QUERY_KEY],
    queryFn: () => fetchRelocationPerks("candidate"),
    staleTime: 5 * 60 * 1000,
  });

  return {
    title: data?.title?.trim() || RELOCATION_PERKS_FALLBACK_TITLE,
    subtitle: data?.subtitle?.trim() || RELOCATION_PERKS_FALLBACK_SUBTITLE,
  };
}
