import type { OccupationIdentifier } from "../types/mobility";

/** One line per title preserves commas and prevents unrelated edits losing mappings. */
export function occupationsFromLines(value: string, existing: OccupationIdentifier[]): OccupationIdentifier[] {
  const seen = new Set<string>();
  return value.split(/\r?\n/).map((label) => label.trim()).filter(Boolean).filter((label) => {
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  }).flatMap((label) => {
    const matches = existing.filter((occupation) => occupation.label === label);
    // Preserve all stored identities for an unchanged label; an editor save is
    // not a review decision that can resolve a conflicting legacy mapping.
    return matches.length ? matches.map((occupation) => ({ ...occupation })) : [{ scheme: "free_text", label }];
  });
}
