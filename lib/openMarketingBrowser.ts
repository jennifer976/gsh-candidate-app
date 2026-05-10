import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

async function openInBrowserSheet(url: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    await Linking.openURL(url);
  }
}

/** Employer / ATS apply links and other third-party HTTPS URLs (never globalsponsorhub.com marketing pages). */
export async function openExternalHttpsUrl(rawUrl: string): Promise<void> {
  const trimmed = rawUrl.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error("Invalid URL");
  }
  await openInBrowserSheet(trimmed);
}
