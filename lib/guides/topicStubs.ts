/**
 * Fallback content only for routes that are **not** in `lib/guides/seo` pillar data (same catalogue as the website).
 * SEO pillars and `/relocating/*` guides use full `SeoPillarPageConfig` — see `getPillarPageByPath`.
 */
export type GuideTopicStub = {
  title: string;
  intro: string;
  bullets: string[];
};

export const GUIDE_TOPIC_STUBS: Record<string, GuideTopicStub> = {
  "/partners/directory": {
    title: "Partner directory",
    intro: "Browse relocation, legal, and mobility partners from this app.",
    bullets: [
      "Use filters on the Partners tab to match your bottleneck (visa, tax, shipping, schooling).",
      "Shortlist providers and confirm engagement terms directly.",
      "Return anytime from Guides or the main navigation.",
    ],
  },
};

export function getGuideTopicStub(href: string): GuideTopicStub | undefined {
  const key = href.trim().split("#")[0].split("?")[0];
  return GUIDE_TOPIC_STUBS[key];
}
