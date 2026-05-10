import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { getMarketingSiteUrl } from "@/lib/config";

/** Opens a path on the public Global Sponsor Hub website (e.g. `/blog`, `/visa-sponsorship-jobs`). */
export async function openWebsitePath(path: string): Promise<void> {
  const base = getMarketingSiteUrl().replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${p}`;
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    await Linking.openURL(url);
  }
}
