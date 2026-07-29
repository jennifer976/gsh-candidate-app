import inventory from "@/data/public-route-parity.json";
import { getMarketingSiteUrl } from "@/lib/config";

type InventoryRow = {
  pattern: string;
  mode: "native" | "native-query" | "fallback";
  target?: string;
  defaultTarget?: string;
};

export type PublicRouteResolution =
  | { kind: "native"; route: string }
  | { kind: "fallback"; url: string };

function siteUrlFor(pathname: string, search: string, hash: string): string {
  return `${getMarketingSiteUrl()}${pathname}${search}${hash}`;
}

function replaceCaptures(target: string, match: RegExpMatchArray): string {
  return target.replace(/\$(\d+)/g, (_, index: string) => encodeURIComponent(match[Number(index)] ?? ""));
}

function queryTarget(row: InventoryRow, search: string): string | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const placeholder = row.target?.match(/\{([^}]+)\}/);
  if (!row.target || !placeholder) return row.defaultTarget ?? null;
  const value = placeholder[1].split("|").map((key) => params.get(key)).find(Boolean);
  return value ? row.target.replace(placeholder[0], encodeURIComponent(value)) : row.defaultTarget ?? null;
}

/**
 * Resolves every maintained public route to a native screen or the exact canonical
 * first-party page. Unknown GSH paths deliberately preserve their path/query/hash.
 */
export function resolvePublicRoute(input: string): PublicRouteResolution | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = /^https?:\/\//i.test(trimmed)
      ? new URL(trimmed)
      : new URL(trimmed.startsWith("/") ? trimmed : `/${trimmed}`, getMarketingSiteUrl());
  } catch {
    return null;
  }

  const marketingHost = new URL(getMarketingSiteUrl()).hostname.replace(/^www\./, "").toLowerCase();
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (host !== marketingHost && host !== "globalsponsorhub.com" && !host.endsWith(".globalsponsorhub.com")) {
    return { kind: "fallback", url: url.toString() };
  }

  const pathname = url.pathname.replace(/\/{2,}/g, "/") || "/";
  for (const row of inventory.routes as InventoryRow[]) {
    const match = pathname.match(new RegExp(row.pattern, "i"));
    if (!match) continue;
    if (row.mode === "fallback") {
      return { kind: "fallback", url: siteUrlFor(pathname, url.search, url.hash) };
    }
    const target = row.mode === "native-query" ? queryTarget(row, url.search) : row.target && replaceCaptures(row.target, match);
    if (target) return { kind: "native", route: target };
    return { kind: "fallback", url: siteUrlFor(pathname, url.search, url.hash) };
  }

  return { kind: "fallback", url: siteUrlFor(pathname, url.search, url.hash) };
}
