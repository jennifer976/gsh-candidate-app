import type { Router } from "expo-router";
import { getMarketingSiteUrl } from "@/lib/config";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";

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

  if (pathname.endsWith("/tools/visa-wizard")) {
    router.push("/visa-wizard");
    return true;
  }

  if (pathname === "/guides") {
    router.push("/guides");
    return true;
  }

  const countryGuide = pathname.match(/^\/guides\/country\/([^/]+)$/);
  if (countryGuide?.[1]) {
    router.push(`/guides/country/${countryGuide[1]}`);
    return true;
  }

  if (pathname.endsWith("/jobs/external")) {
    const jid = qs.get("job");
    if (jid && /^[a-f0-9]{24}$/i.test(jid)) {
      router.push(`/external-job/${jid}`);
      return true;
    }
    router.push("/curated-listings");
    return true;
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

  const norm = pathname.replace(/\/+$/, "") || "/";

  const blogMatch = norm.match(/^\/blog(?:\/([^/?]+))?$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    router.push(slug ? `/blog/${slug}` : "/blog");
    return true;
  }

  if (norm === "/faqs" || norm === "/faq") {
    router.push("/faq");
    return true;
  }
  if (norm === "/contact") {
    router.push("/contact");
    return true;
  }
  if (norm === "/global-news") {
    router.push("/news");
    return true;
  }
  if (norm === "/resources") {
    router.push("/guides");
    return true;
  }

  if (norm === "/privacy-policy") {
    router.push("/legal/privacy-policy");
    return true;
  }
  if (norm === "/terms-and-conditions" || norm === "/terms") {
    router.push("/legal/terms-and-conditions");
    return true;
  }
  if (norm === "/cookie-policy") {
    router.push("/legal/cookie-policy");
    return true;
  }
  if (norm === "/acceptable-use") {
    router.push("/legal/acceptable-use");
    return true;
  }
  if (norm === "/legal") {
    router.push("/legal");
    return true;
  }

  if (norm.startsWith("/learn")) {
    router.push("/tools-resources");
    return true;
  }
  if (norm.startsWith("/candidate/tools")) {
    router.push("/tools");
    return true;
  }

  router.push("/tools-resources");
  return true;
}

/**
 * Routes notification `link` payloads into in-app screens when possible; other https links open in the in-app WebView sheet.
 */
export function navigateFromPushLink(router: Router, link: string): boolean {
  const trimmed = link.trim();
  if (!trimmed) return false;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      if (!isOurMarketingHost(u.hostname)) {
        openExternalUrlInApp(trimmed);
        return true;
      }
      const pathname = u.pathname.replace(/\/+$/, "") || "/";
      return navigateInternalPath(router, pathname, u.search);
    } catch {
      try {
        openExternalUrlInApp(trimmed);
      } catch {
        /* ignore invalid notification URL */
      }
      return true;
    }
  }

  const [pathPart, queryPart] = trimmed.split("?");
  const pathname = (pathPart || "/").replace(/\/+$/, "") || "/";
  const search = queryPart ? `?${queryPart}` : "";
  return navigateInternalPath(router, pathname, search);
}
