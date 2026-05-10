import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { marketingUrl } from "@/lib/marketing-links";

async function openInBrowserSheet(url: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    await Linking.openURL(url);
  }
}

/**
 * Opens a marketing-site URL in Safari / Chrome (not an embedded WebView).
 * Keeps consent banners and legal UX solely on the website.
 */
export async function openMarketingBrowser(pathOrUrl: string): Promise<void> {
  const trimmed = pathOrUrl.trim();
  const url = /^https?:\/\//i.test(trimmed) ? trimmed : marketingUrl(trimmed);
  await openInBrowserSheet(url);
}

/** Employer / ATS apply links (third-party HTTPS). Same sheet + fallback as hub links. */
export async function openExternalHttpsUrl(rawUrl: string): Promise<void> {
  const trimmed = rawUrl.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error("Invalid URL");
  }
  await openInBrowserSheet(trimmed);
}
