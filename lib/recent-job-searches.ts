import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "gsh_candidate_recent_job_searches_v1";
const MAX = 8;

export async function loadRecentJobSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string").slice(0, MAX)
      : [];
  } catch {
    return [];
  }
}

/** Dedupes case-insensitively, caps length. Returns the updated list. */
export async function addRecentJobSearch(query: string): Promise<string[]> {
  const q = query.trim();
  if (q.length < 3) return loadRecentJobSearches();
  const prev = await loadRecentJobSearches();
  const next = [q, ...prev.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, MAX);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
