import * as Linking from "expo-linking";
import type { Router } from "expo-router";
import { getMarketingSiteUrl } from "@/lib/config";
import { openMarketingBrowser } from "@/lib/openMarketingBrowser";

function normalizeHostname(host: string): string {
  return host.toLowerCase().replace(/^www\./, "");
}

function isOurMarketingHost(host: string): boolean {
  try {
    const marketing = normalizeHostname(new URL(getMarketingSiteUrl()).hostname);
    const h = normalizeHostname(host);
    return h === marketing || h.endsWith(".globalsponsorhub.com") || h === "globalsponsorhub.com";
  } catch {
    return normalizeHostname(host).includes("globalsponsorhub");
  }
}

function navigateInternalPath(router: Router, pathname: string, search: string): boolean {
  const qs = new URLSearchParams(search.startsWith("?") ? search.slice(1) : "");

  if (pathname.endsWith("/jobs/external")) {
    const jid = qs.get("job");
    if (jid && /^[a-f0-9]{24}$/i.test(jid)) {
      router.push(`/external-job/${jid}`);
      return true;
    }
  }

  if (pathname.endsWith("/candidate/job-details")) {
    const jid = qs.get("id") || qs.get("job");
    if (jid && /^[a-f0-9]{24}$/i.test(jid)) {
      router.push(`/job/${jid}`);
      return true;
    }
  }

  const hubJob = pathname.match(/^\/jobs\/([a-f0-9]{24})$/i);
  if (hubJob) {
    router.push(`/job/${hubJob[1]}`);
    return true;
  }

  if (pathname.endsWith("/candidate/my-jobs")) {
    router.push("/(tabs)/applications");
    return true;
  }

  if (pathname.includes("/candidate/saved") || pathname.endsWith("/saved-jobs")) {
    router.push("/(tabs)/saved");
    return true;
  }

  const convPath = pathname.match(/\/conversation\/([^/?#]+)/i);
  if (convPath?.[1]) {
    router.push(`/conversation/${convPath[1]}`);
    return true;
  }

  if (pathname.includes("/messages")) {
    const cid = qs.get("conversationId") || qs.get("conversation") || qs.get("thread");
    if (cid && cid.length > 4) {
      router.push(`/conversation/${cid}`);
      return true;
    }
    router.push("/(tabs)/messages");
    return true;
  }

  void openMarketingBrowser(`${pathname}${search}`);
  return true;
}

/**
 * Routes notification `link` payloads into in-app screens when possible; opens the system browser for third-party URLs.
 */
export function navigateFromPushLink(router: Router, link: string): boolean {
  const trimmed = link.trim();
  if (!trimmed) return false;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      if (!isOurMarketingHost(u.hostname)) {
        void Linking.openURL(trimmed);
        return true;
      }
      const pathname = u.pathname.replace(/\/+$/, "") || "/";
      return navigateInternalPath(router, pathname, u.search);
    } catch {
      void Linking.openURL(trimmed);
      return true;
    }
  }

  const [pathPart, queryPart] = trimmed.split("?");
  const pathname = (pathPart || "/").replace(/\/+$/, "") || "/";
  const search = queryPart ? `?${queryPart}` : "";
  return navigateInternalPath(router, pathname, search);
}
