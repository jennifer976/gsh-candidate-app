import Parser from "rss-parser";

export type RssHeadline = {
  title: string;
  link: string;
  isoDate?: string;
  source: string;
};

const parser = new Parser({
  timeout: 20000,
  headers: {
    "User-Agent": "GlobalSponsorHub-CandidateApp/1.0",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

const DEFAULT_RSS_FEEDS = [
  "https://freemovement.org.uk/feed/",
  "https://home-affairs.ec.europa.eu/node/2/rss_en",
  "https://ec.europa.eu/migrant-integration/news_en.rss",
  "https://www.iom.int/news/rss.xml",
  "https://www.unhcr.org/rss.xml",
  "https://www.uscis.gov/newsroom/all-news/rss",
  "https://immigrationforum.org/feed/",
  "https://www.migrationpolicy.org/rss/fullsite",
  "https://www.gov.uk/government/organisations/uk-visas-and-immigration.atom",
  "https://www.canada.ca/en/immigration-refugees-citizenship/news/feeds/atom.xml",
  "https://immi.homeaffairs.gov.au/rss-feeds/news-and-updates",
  "https://www.immigration.govt.nz/about-us/media-centre/news-notifications/feed.rss",
];

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

function immigrationTitleScore(title: string): number {
  let s = 0;
  if (WORK_MOBILITY_SIGNAL.test(title)) s += 18;
  if (POLICY_VISA_SIGNAL.test(title)) s += 14;
  if (AUTHORITY_SIGNAL.test(title)) s += 8;
  if (/\b(immigration rules|immigration bill|visa fee|visa application|passport office)\b/i.test(title)) s += 10;
  if (/\b(deport|detention|removal|compliance|audit)\b/i.test(title)) s += 6;
  const hasWorkOrPolicy = WORK_MOBILITY_SIGNAL.test(title) || POLICY_VISA_SIGNAL.test(title);
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
  return s;
}

const MIN_HEADLINE_SCORE = 12;
const MAX_HEADLINES_RETURNED = 14;

function shouldIncludeHeadline(title: string): boolean {
  return immigrationTitleScore(title) >= MIN_HEADLINE_SCORE;
}

function maxHeadlineAgeMs(): number {
  const days = 365;
  return days * 86_400_000;
}

function isWithinFreshnessWindow(isoDate: string | undefined): boolean {
  if (!isoDate) return true;
  const t = Date.parse(isoDate);
  if (!Number.isFinite(t)) return true;
  return Date.now() - t <= maxHeadlineAgeMs();
}

function hostnameLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "News";
  }
}

/**
 * Immigration-focused RSS headlines (third-party publishers — not globalsponsorhub.com).
 */
export async function fetchImmigrationRssHeadlines(): Promise<RssHeadline[]> {
  const urls = DEFAULT_RSS_FEEDS;
  const all: RssHeadline[] = [];

  for (const url of urls) {
    try {
      const feed = await parser.parseURL(url);
      const source =
        feed.title?.replace(/\s*(\(RSS\)|RSS|Feed).*$/i, "").trim() || hostnameLabel(url);
      for (const item of (feed.items ?? []).slice(0, 10)) {
        const link = item.link?.trim();
        const title = item.title?.trim();
        if (!link || !title) continue;
        if (!shouldIncludeHeadline(title)) continue;
        const isoDate = item.isoDate || item.pubDate;
        if (!isWithinFreshnessWindow(isoDate)) continue;
        all.push({ title, link, isoDate, source });
      }
    } catch {
      /* skip bad feeds */
    }
  }

  all.sort((a, b) => {
    const da = a.isoDate ? Date.parse(a.isoDate) : 0;
    const db = b.isoDate ? Date.parse(b.isoDate) : 0;
    const dateCmp = db - da;
    if (dateCmp !== 0) return dateCmp;
    return immigrationTitleScore(b.title) - immigrationTitleScore(a.title);
  });

  return all.slice(0, MAX_HEADLINES_RETURNED);
}
