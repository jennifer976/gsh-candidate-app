export const CURRENCY_CODES = ["USD", "EUR", "GBP", "CAD", "AUD", "INR", "NGN", "AED"];
export type ReferenceRates = { rates: Record<string, number>; updatedAt: number; updatedLabel: string };

export function parseReferenceRates(data: unknown, codes: string[], now = Date.now()): ReferenceRates | null {
  if (!data || typeof data !== "object") return null;
  const payload = data as { result?: string; base_code?: string; rates?: Record<string, unknown>; time_last_update_unix?: number };
  const timestamp = Number(payload.time_last_update_unix) * 1000;
  if (payload.result !== "success" || payload.base_code !== "USD" || !Number.isFinite(timestamp) || now - timestamp > 72 * 60 * 60 * 1000 || timestamp - now > 5 * 60 * 1000) return null;
  const rates: Record<string, number> = {};
  for (const code of codes) {
    const rate = Number(payload.rates?.[code]);
    if (!Number.isFinite(rate) || rate <= 0) return null;
    rates[code] = 1 / rate;
  }
  return { rates, updatedAt: timestamp, updatedLabel: new Date(timestamp).toLocaleString("en-GB", { timeZone: "UTC" }) + " UTC" };
}

export function convertAmount(amount: number, from: string, to: string, rates: Record<string, number>): number | null {
  if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(rates[from]) || rates[from] <= 0 || !Number.isFinite(rates[to]) || rates[to] <= 0) return null;
  const result = amount * rates[from] / rates[to];
  return Number.isFinite(result) ? result : null;
}

export async function fetchLiveRatesToUsd(codes = CURRENCY_CODES): Promise<ReferenceRates | { error: true }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", { signal: controller.signal });
    if (!response.ok) return { error: true };
    return parseReferenceRates(await response.json(), codes) ?? { error: true };
  } catch { return { error: true }; } finally { clearTimeout(timer); }
}
