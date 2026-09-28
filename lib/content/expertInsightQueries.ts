import { SupabaseNotConfiguredError, type BlogSectionRow } from "@/lib/content/blogQueries";
import { getPublicSupabase } from "@/lib/supabasePublic";

export type ExpertInsightRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  readMinutes: number | null;
  publishedAt: string;
  contributorName: string;
};

export type ExpertContributorRow = {
  name: string;
  role: string;
  bio: string;
};

/** Published expert articles, matching the website's `/resources` library. */
export async function fetchPublishedExpertInsights(): Promise<ExpertInsightRow[]> {
  const sb = getPublicSupabase();
  if (!sb) throw new SupabaseNotConfiguredError();
  const { data: contributors, error: contributorError } = await sb
    .from("expert_contributors")
    .select("id, name")
    .eq("is_published", true);
  if (contributorError) throw new Error(contributorError.message || "EXPERT_CONTRIBUTORS_FAILED");
  if (!contributors?.length) return [];
  const names = new Map(contributors.map((row) => [String(row.id), String(row.name)]));
  const { data, error } = await sb
    .from("expert_insights")
    .select("id, slug, title, excerpt, read_minutes, published_at, contributor_id")
    .eq("is_published", true)
    .not("published_at", "is", null)
    .in("contributor_id", [...names.keys()])
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message || "EXPERT_INSIGHTS_FAILED");
  return (data ?? []).map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt ?? ""),
    readMinutes: typeof row.read_minutes === "number" ? row.read_minutes : null,
    publishedAt: String(row.published_at),
    contributorName: names.get(String(row.contributor_id)) ?? "",
  }));
}

export async function fetchExpertInsightBySlug(slug: string): Promise<{
  insight: ExpertInsightRow;
  contributor: ExpertContributorRow;
  sections: BlogSectionRow[];
} | null> {
  const sb = getPublicSupabase();
  if (!sb) throw new SupabaseNotConfiguredError();
  const { data: insight, error } = await sb
    .from("expert_insights")
    .select("id, slug, title, excerpt, read_minutes, published_at, contributor:expert_contributors!inner(name, role, bio, is_published)")
    .eq("slug", slug)
    .eq("is_published", true)
    .not("published_at", "is", null)
    .maybeSingle();
  if (error) throw new Error(error.message || "EXPERT_INSIGHT_FAILED");
  if (!insight) return null;
  const raw = insight.contributor as unknown;
  const contributor = (Array.isArray(raw) ? raw[0] : raw) as
    | { name: string; role: string | null; bio: string | null; is_published: boolean }
    | null;
  if (!contributor?.is_published) return null;
  const { data: sections, error: sectionsError } = await sb
    .from("expert_insight_sections")
    .select("id, type, order_index, content")
    .eq("insight_id", String(insight.id))
    .order("order_index", { ascending: true });
  if (sectionsError) throw new Error(sectionsError.message || "EXPERT_SECTIONS_FAILED");
  return {
    insight: {
      id: String(insight.id),
      slug: String(insight.slug),
      title: String(insight.title),
      excerpt: String(insight.excerpt ?? ""),
      readMinutes: typeof insight.read_minutes === "number" ? insight.read_minutes : null,
      publishedAt: String(insight.published_at),
      contributorName: contributor.name,
    },
    contributor: { name: contributor.name, role: contributor.role ?? "", bio: contributor.bio ?? "" },
    sections: (sections ?? []) as BlogSectionRow[],
  };
}
