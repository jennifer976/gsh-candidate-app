import { XMLParser } from "fast-xml-parser";

export type RssHeadline = {
  title: string;
  link: string;
  isoDate?: string;
  source: string;
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
});

function asArray<T>(x: T | T[] | undefined): T[] {
  if (x == null) return [];
  return Array.isArray(x) ? x : [x];
}

function textContent(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") {
    const t = v.trim();
    return t || undefined;
  }
  if (typeof v === "object" && v !== null && "#text" in v) {
    const t = (v as { "#text"?: string })["#text"];
    return typeof t === "string" ? t.trim() || undefined : undefined;
  }
  return undefined;
}

type ParsedItem = { title?: string; link?: string; isoDate?: string; source?: string };

function parseAtomEntry(entry: Record<string, unknown>): ParsedItem {
  const itemTitle = textContent(entry.title);
  let link: string | undefined;
  const links = asArray(entry.link as object | object[] | undefined);
  for (const l of links) {
    if (l && typeof l === "object" && "@_href" in l) {
      const attrs = l as Record<string, string | undefined>;
      const href = attrs["@_href"];
      const rel = attrs["@_rel"];
      if (href && (!rel || rel === "alternate")) {
        link = href;
        break;
      }
    }
  }
  if (!link && entry.link && typeof entry.link === "object") {
    const l = entry.link as Record<string, string | undefined>;
    if (typeof l["@_href"] === "string") link = l["@_href"];
  }
  const updated = entry.updated ?? entry.published;
  let isoDate: string | undefined;
  if (typeof updated === "string") isoDate = updated;
  else isoDate = textContent(updated);
  return { title: itemTitle, link, isoDate };
}

function parseFeedXml(xml: string): { feedTitle?: string; items: ParsedItem[] } {
  let root: Record<string, unknown>;
  try {
    root = xmlParser.parse(xml) as Record<string, unknown>;
  } catch {
    return { items: [] };
  }

  const feed = root.feed as Record<string, unknown> | undefined;
  if (feed) {
    const feedTitle = textContent(feed.title);
    const entries = asArray(feed.entry as Record<string, unknown> | Record<string, unknown>[] | undefined);
    const items = entries.map((e) => parseAtomEntry(e));
    return { feedTitle, items };
  }

  const rss = root.rss as { channel?: Record<string, unknown> | Record<string, unknown>[] } | undefined;
  const channelRaw = rss?.channel;
  const channel = Array.isArray(channelRaw) ? channelRaw[0] : channelRaw;
  if (!channel || typeof channel !== "object") {
    return { items: [] };
  }

  const feedTitle =
    typeof channel.title === "string"
      ? channel.title.trim()
      : textContent(channel.title);
  const rawItems = asArray(channel.item as Record<string, unknown> | Record<string, unknown>[] | undefined);
  const items: ParsedItem[] = rawItems.map((item) => {
    const title =
      typeof item.title === "string" ? item.title.trim() : textContent(item.title);
    let link: string | undefined;
    if (typeof item.link === "string") link = item.link.trim();
    else link = textContent(item.link);
    const pubDate = item.pubDate;
    const isoDate =
      typeof pubDate === "string"
        ? pubDate.trim()
        : textContent(pubDate) ?? (typeof item["dc:date"] === "string" ? item["dc:date"] : undefined);
    const source = textContent(item.source);
    return { title, link, isoDate, source };
  });

  return { feedTitle: feedTitle ?? undefined, items };
}

const DEFAULT_RSS_FEEDS = [
  // Google News topic search — most reliable, freshest, broadest. Item titles carry the publisher.
  "https://news.google.com/rss/search?q=immigration+visa+policy+changes+when:60d&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=work+visa+sponsorship+skilled+worker+when:60d&hl=en-GB&gl=GB&ceid=GB:en",
  "https://news.google.com/rss/search?q=%22immigration+rules%22+OR+%22visa+changes%22+when:60d&hl=en-GB&gl=GB&ceid=GB:en",
  "https://news.google.com/rss/search?q=immigration+visa+(Canada+OR+Australia+OR+%22New+Zealand%22+OR+Ireland)+when:60d&hl=en&gl=US&ceid=US:en",
  // Official / specialist sources still serving valid feeds.
  "https://www.gov.uk/government/organisations/uk-visas-and-immigration.atom",
  "https://www.gov.uk/search/news-and-communications.atom?organisations%5B%5D=uk-visas-and-immigration",
  "https://home-affairs.ec.europa.eu/node/2/rss_en",
  "https://freemovement.org.uk/feed/",
];

const GOOGLE_NEWS_HOST = "news.google.com";

/** Google News titles are "Headline - Publisher"; split off the publisher for a clean title + source. */
function splitGoogleNewsTitle(title: string): { title: string; publisher: string | null } {
  const idx = title.lastIndexOf(" - ");
  if (idx > 0 && title.length - idx <= 60) {
    const publisher = title.slice(idx + 3).trim();
    const clean = title.slice(0, idx).trim();
    if (clean.length >= 12 && publisher.length >= 2) return { title: clean, publisher };
  }
  return { title, publisher: null };
}

const WORK_MOBILITY_SIGNAL =
  /\b(work permit|work visa|employer|sponsor(?:ship)?|labou?r market impact|lmia|skilled worker|skilled migration|occupation list|shortage list|express entry|provincial nominee|job offer|points[- ]based|graduate route|post[- ]study|pgwp|stem opt|digital nomad|global talent|start[- ]?up visa|salary threshold|right to work|post[- ]study work|blue card|eur(?:opean)? blue card|high[- ]skilled|talent visa)\b/i;

const POLICY_VISA_SIGNAL =
  /\b(visa|visas|schengen|student visa|family visa|spouse visa|dependent visa|visitor visa|citizenship|naturali[sz]ation|settlement|leave to remain|\bilr\b|pre[- ]?settled|eu settlement|euss|green card|h[- ]?1b|h[- ]?2|o[- ]?1|l[- ]?1|ead|extension\b.*\bvisa|visa fee|visa application|visa backlog|processing times?|immigration rules|immigration bill|immigration levels|immigration plan|immigration target|immigration cap|immigration policy|immigration programme|immigration program|migration policy|economic immigration|border (?:policy|security))\b/i;

const AUTHORITY_SIGNAL =
  /\b(uscis|ukvi|ircc|home affairs|department of home affairs|immigration new zealand|uk visas and immigration)\b/i;

const TRAVEL_ADVICE_NO_IMMIGRATION =
  /\b(foreign travel advice|travel advice for|terrorism and unrest|safety and security|healthcare abroad|summary.*health)\b/i;

const CRISIS_INCIDENT_ONLY =
  /\b(dies?(?: at)? sea|capsiz|shipwreck|found dead|mass grave|drown(?:ing)?|bodies (?:found|recovered))\b/i;

const SPORTS_ENTERTAINMENT_NOISE =
  /\b(world cup|premier league|footballer|football match|striker|midfielder|defender|goalkeeper|\bnba\b|\bnfl\b|olympics?|cricket|rugby|tennis|box(?:er|ing)|concert|tour dates?|album|movie|film festival|celebrity)\b/i;

const POLICY_ACTION_SIGNAL =
  /\b(new|change[ds]?|changing|reform|overhaul|tighten\w*|tougher|relax\w*|eas(?:e|ed|ing)|scrap\w*|abolish\w*|cap|quota|ballot|lottery|cut|raise[ds]?|increase[ds]?|hike|threshold|route|scheme|programme|program|white paper|announce\w*|introduc\w*|launch\w*|extend\w*|suspend\w*|resum\w*|reopen\w*|paus\w*|ban\w*|restrict\w*|requir\w*|forc(?:e|ed|ing)|memo|eligibility|requirement|deadline|backlog|processing|fee[s]?|rule[s]?|policy|update[ds]?|crackdown|plan|target|salary)\b/i;

const ENFORCEMENT_CRIME_ONLY =
  /\b(arrested|charged|sentenced|jailed|convicted|smuggl\w*|trafficking|gang|kidnap\w*|raid(?:ed|s)?|murder|assault)\b/i;

function immigrationTitleScore(title: string): number {
  let s = 0;
  if (WORK_MOBILITY_SIGNAL.test(title)) s += 18;
  if (POLICY_VISA_SIGNAL.test(title)) s += 14;
  if (AUTHORITY_SIGNAL.test(title)) s += 8;
  if (/\b(immigration rules|immigration bill|visa fee|visa application|passport office)\b/i.test(title)) s += 10;
  if (/\b(deport|detention|removal|compliance|audit)\b/i.test(title)) s += 6;
  const hasWorkOrPolicy = WORK_MOBILITY_SIGNAL.test(title) || POLICY_VISA_SIGNAL.test(title);
  const hasDomain = hasWorkOrPolicy || AUTHORITY_SIGNAL.test(title);
  if (hasDomain && POLICY_ACTION_SIGNAL.test(title)) {
    s += 8;
  }
  if (/\b(refugee|asylum|resettlement|humanitarian)\b/i.test(title)) {
    s += hasWorkOrPolicy ? 5 : -12;
  }
  if (/\b(migration|immigrant|immigration)\b/i.test(title) && !hasWorkOrPolicy) {
    s += 2;
  }
  if (TRAVEL_ADVICE_NO_IMMIGRATION.test(title) && !hasWorkOrPolicy && !AUTHORITY_SIGNAL.test(title)) {
    s -= 35;
  }
  if (CRISIS_INCIDENT_ONLY.test(title) && !hasWorkOrPolicy) {
    s -= 28;
  }
  if (SPORTS_ENTERTAINMENT_NOISE.test(title)) {
    s -= 30;
  }
  if (ENFORCEMENT_CRIME_ONLY.test(title) && !POLICY_ACTION_SIGNAL.test(title)) {
    s -= 26;
  }
  return s;
}

const MIN_HEADLINE_SCORE = 16;
const MAX_HEADLINES_RETURNED = 14;

function shouldIncludeHeadline(title: string): boolean {
  return immigrationTitleScore(title) >= MIN_HEADLINE_SCORE;
}

function maxHeadlineAgeMs(): number {
  const days = 60;
  return days * 86_400_000;
}

function isWithinFreshnessWindow(isoDate: string | undefined): boolean {
  if (!isoDate) return false;
  const t = Date.parse(isoDate);
  if (!Number.isFinite(t)) return false;
  return Date.now() - t <= maxHeadlineAgeMs();
}

function hostnameLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "News";
  }
}

async function fetchAndParseFeed(url: string): Promise<{ title?: string; items: ParsedItem[] }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "GlobalSponsorHub-CandidateApp/1.0",
        Accept: "application/rss+xml, application/xml, application/atom+xml, text/xml, */*",
      },
    });
    if (!res.ok) return { items: [] };
    const xml = await res.text();
    return parseFeedXml(xml);
  } finally {
    clearTimeout(t);
  }
}

/**
 * Immigration-focused RSS headlines (third-party publishers — not globalsponsorhub.com).
 */
export async function fetchImmigrationRssHeadlines(): Promise<RssHeadline[]> {
  const urls = DEFAULT_RSS_FEEDS;
  const all: RssHeadline[] = [];

  const batches = await Promise.all(
    urls.map(async (url) => {
      const isGoogleNews = url.includes(GOOGLE_NEWS_HOST);
      try {
        const { title: parsedFeedTitle, items } = await fetchAndParseFeed(url);
        const feedSource =
          parsedFeedTitle?.replace(/\s*(\(RSS\)|RSS|Feed).*$/i, "").trim() || hostnameLabel(url);
        const headlines: RssHeadline[] = [];
        const limit = isGoogleNews ? 30 : 10;
        for (const item of items.slice(0, limit)) {
          const link = item.link?.trim();
          const rawTitle = item.title?.trim();
          if (!link || !rawTitle) continue;

          let title = rawTitle;
          let source = feedSource;
          if (isGoogleNews) {
            const split = splitGoogleNewsTitle(rawTitle);
            title = split.title;
            source = item.source?.trim() || split.publisher || "Google News";
          }

          if (!shouldIncludeHeadline(title)) continue;
          const isoDate = item.isoDate;
          if (!isWithinFreshnessWindow(isoDate)) continue;
          headlines.push({ title, link, isoDate, source });
        }
        return headlines;
      } catch {
        return [] as RssHeadline[];
      }
    })
  );

  for (const batch of batches) {
    all.push(...batch);
  }

  all.sort((a, b) => {
    const da = a.isoDate ? Date.parse(a.isoDate) : 0;
    const db = b.isoDate ? Date.parse(b.isoDate) : 0;
    const dateCmp = db - da;
    if (dateCmp !== 0) return dateCmp;
    return immigrationTitleScore(b.title) - immigrationTitleScore(a.title);
  });

  // De-duplicate across feeds (the Google News queries overlap heavily).
  const seen = new Set<string>();
  const deduped: RssHeadline[] = [];
  for (const h of all) {
    const key = h.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(h);
  }

  return deduped.slice(0, MAX_HEADLINES_RETURNED);
}
