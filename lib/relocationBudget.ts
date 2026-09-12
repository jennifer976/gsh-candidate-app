/** A blank cost is unknown; zero is an explicit estimate. */
export function parseBudgetCost(raw: unknown): number | null | undefined {
  if (raw === undefined || raw === null || (typeof raw === "string" && !raw.trim())) return undefined;
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  // Accept decimal keyboards from every supported language without interpreting grouping separators.
  // Three digits after a separator are ambiguous (1,000 could mean one or one thousand), so ask for correction.
  const text = String(raw).trim();
  if (!/^(?:\d+|\d*[.,]\d{1,2})$/.test(text)) return null;
  const value = Number(text.replace(",", "."));
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function restoreBudgetCost(raw: unknown): string {
  return typeof raw === "string" || typeof raw === "number" ? String(raw) : "";
}

export function summarizeBudget(budget: Record<string, unknown>, items: readonly string[]) {
  let total = 0;
  let missingCount = 0;
  const invalidItems: string[] = [];
  for (const item of items) {
    const value = parseBudgetCost(budget[item]);
    if (value === undefined) missingCount++;
    else if (value === null) invalidItems.push(item);
    else total += value;
  }
  const invalid = invalidItems.length > 0 || !Number.isFinite(total);
  return { total: invalid || missingCount === items.length ? null : total, missingCount, invalid, invalidItems };
}
