import type { AppLanguage } from "./i18n/catalog";

/** Keep third-party URLs byte-for-byte unchanged. Only our configured website receives a locale. */
export function websiteUrlWithLanguage(rawUrl: string, siteOrigin: string, locale: AppLanguage): string {
  try {
    const url = new URL(rawUrl);
    const site = new URL(siteOrigin);
    if (!["http:", "https:"].includes(url.protocol) || url.origin !== site.origin || url.username || url.password) return rawUrl;
    if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) return rawUrl;
    url.searchParams.set("siteLanguage", locale);
    return url.toString();
  } catch {
    return rawUrl;
  }
}

/** Accept language changes from our website only, never from an external application or partner page. */
export function websiteLanguageMessage(raw: string, pageUrl: string, siteOrigin: string): AppLanguage | null {
  try {
    const page = new URL(pageUrl), site = new URL(siteOrigin);
    if (!["http:", "https:"].includes(page.protocol) || page.origin !== site.origin || page.username || page.password) return null;
    const message = JSON.parse(raw);
    if (message?.type !== "site-language-changed" || typeof message.locale !== "string") return null;
    return ["en", "fr", "de", "es", "pt", "it", "nl", "pl"].includes(message.locale) ? message.locale as AppLanguage : null;
  } catch { return null; }
}
