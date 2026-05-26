export const RATES_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.26,
  CAD: 0.74,
  AUD: 0.66,
  INR: 0.012,
  NGN: 0.00067,
  AED: 0.27,
};

export const CURRENCY_CODES = Object.keys(RATES_TO_USD);

export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  const usd = amount * (rates[from] ?? 1);
  return usd / (rates[to] ?? 1);
}

export async function fetchLiveRatesToUsd(
  codes: string[]
): Promise<{ rates: Record<string, number>; updatedLabel: string } | { error: true }> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) throw new Error("FX unavailable");
    const data = await res.json();
    const table: Record<string, number> = {};
    for (const code of codes) {
      const toCurrencyRate = Number(data?.rates?.[code]);
      if (Number.isFinite(toCurrencyRate) && toCurrencyRate > 0) {
        table[code] = 1 / toCurrencyRate;
      }
    }
    if (Object.keys(table).length < 3) return { error: true };
    return { rates: table, updatedLabel: new Date().toLocaleString("en-GB") };
  } catch {
    return { error: true };
  }
}
