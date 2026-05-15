import * as Linking from "expo-linking";
import { useInAppWebStore } from "@/lib/in-app-web-store";

/**
 * Opens third-party http(s) pages inside the app (modal WebView). `mailto:` and `tel:` still use the system handler.
 */
export function openExternalUrlInApp(rawUrl: string): void {
  const trimmed = rawUrl.trim();
  if (!trimmed) return;
  if (/^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) {
    void Linking.openURL(trimmed);
    return;
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error("Invalid URL");
  }
  useInAppWebStore.getState().open(trimmed);
}

/** @deprecated Prefer `openExternalUrlInApp` — name kept for existing imports. */
export function openExternalHttpsUrl(rawUrl: string): void {
  openExternalUrlInApp(rawUrl);
}
