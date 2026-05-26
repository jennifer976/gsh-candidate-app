import { SupabaseNotConfiguredError } from "@/lib/content/blogQueries";
import { getPublicSupabase } from "@/lib/supabasePublic";
import type {
  ExpertContributorPublic,
  ExpertInsightArticleBundle,
  ExpertInsightPublic,
  ExpertInsightsCategorySlug,
  ExpertInsightsContentKind,
  ExpertInsightsFormatSlug,
} from "@/lib/expertInsights/types";

export { SupabaseNotConfiguredError };

const CONTRIBUTOR_SELECT =
  "id, slug, name, role, bio, avatar_initials, accent_class, expertise, website_url, website_label";

function mapInsightRow(
  row: Record<string, unknown>,
  contributor: { slug: string; name: string }
): ExpertInsightPublic {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt ?? ""),
    format: row.format as ExpertInsightsFormatSlug,
    kind: row.kind as ExpertInsightsContentKind,
    categorySlug: row.category_slug as ExpertInsightsCategorySlug,
    contributorSlug: contributor.slug,
    publishedAt: String(row.published_at ?? row.created_at),
    readMinutes: typeof row.read_minutes === "number" ? row.read_minutes : undefined,
    featured: Boolean(row.featured),
    contributor_slug: contributor.slug,
    contributor_name: contributor.name,
  };
}

function mapContributor(row: Record<string, unknown>): ExpertContributorPublic {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    role: String(row.role ?? ""),
    bio: String(row.bio ?? ""),
    avatarInitials: row.avatar_initials ? String(row.avatar_initials) : undefined,
    accentClass: row.accent_class ? String(row.accent_class) : undefined,
    expertise: Array.isArray(row.expertise) ? row.expertise.map(String) : [],
    websiteUrl: row.website_url ? String(row.website_url) : undefined,
    websiteLabel: row.website_label ? String(row.website_label) : undefined,
  };
}

export async function fetchPublishedExpertContributors(): Promise<ExpertContributorPublic[]> {
  const sb = getPublicSupabase();
  if (!sb) throw new SupabaseNotConfiguredError();

  const { data, error } = await sb
    .from("expert_contributors")
    .select(CONTRIBUTOR_SELECT)
    .eq("is_published", true)
    .in("subscription_status", ["active", "trialing"])
    .order("name", { ascending: true });

  if (error) throw new Error(error.message || "EXPERT_CONTRIBUTORS_FAILED");
  if (!data) return [];
  return data.map((row) => mapContributor(row as Record<string, unknown>));
}

export async function fetchPublishedExpertInsights(): Promise<ExpertInsightPublic[]> {
  const contributors = await fetchPublishedExpertContributors();
  if (!contributors.length) return [];

  const sb = getPublicSupabase();
  if (!sb) throw new SupabaseNotConfiguredError();

  const byId = new Map(contributors.map((c) => [c.id, c]));
  const { data, error } = await sb
    .from("expert_insights")
    .select(
      "id, slug, title, excerpt, format, kind, category_slug, read_minutes, featured, published_at, contributor_id"
    )
    .eq("is_published", true)
    .not("published_at", "is", null)
    .in(
      "contributor_id",
      contributors.map((c) => c.id)
    )
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message || "EXPERT_INSIGHTS_FAILED");
  if (!data) return [];

  return data.flatMap((row) => {
    const c = byId.get(String(row.contributor_id));
    if (!c) return [];
    return [mapInsightRow(row as Record<string, unknown>, { slug: c.slug, name: c.name })];
  });
}

export async function fetchExpertContributorBySlug(slug: string): Promise<ExpertContributorPublic | null> {
  const sb = getPublicSupabase();
  if (!sb) throw new SupabaseNotConfiguredError();

  const { data, error } = await sb
    .from("expert_contributors")
    .select(CONTRIBUTOR_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .in("subscription_status", ["active", "trialing"])
    .maybeSingle();

  if (error) throw new Error(error.message || "EXPERT_CONTRIBUTOR_FAILED");
  if (!data) return null;
  return mapContributor(data as Record<string, unknown>);
}

export async function fetchExpertInsightsForContributor(contributorId: string): Promise<ExpertInsightPublic[]> {
  const sb = getPublicSupabase();
  if (!sb) throw new SupabaseNotConfiguredError();

  const { data, error } = await sb
    .from("expert_insights")
    .select(
      "id, slug, title, excerpt, format, kind, category_slug, read_minutes, featured, published_at, contributor_id"
    )
    .eq("contributor_id", contributorId)
    .eq("is_published", true)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message || "EXPERT_INSIGHTS_FAILED");
  if (!data) return [];

  const contributor = await sb.from("expert_contributors").select("slug, name").eq("id", contributorId).maybeSingle();
  const cSlug = contributor.data?.slug ? String(contributor.data.slug) : "";
  const cName = contributor.data?.name ? String(contributor.data.name) : "";

  return data.map((row) => mapInsightRow(row as Record<string, unknown>, { slug: cSlug, name: cName }));
}

export async function loadExpertInsightArticle(slug: string): Promise<ExpertInsightArticleBundle | null> {
  const sb = getPublicSupabase();
  if (!sb) throw new SupabaseNotConfiguredError();

  const { data: insight, error: insightError } = await sb
    .from("expert_insights")
    .select(
      `
      id, slug, title, excerpt, format, kind, category_slug, read_minutes, featured, video_url, audio_url, published_at,
      contributor:expert_contributors!inner(
        id, slug, name, role, bio, avatar_initials, accent_class, expertise, website_url, website_label,
        is_published, subscription_status
      )
    `
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (insightError) throw new Error(insightError.message || "EXPERT_ARTICLE_FAILED");
  if (!insight) return null;

  const rawContributor = insight.contributor;
  const c = (Array.isArray(rawContributor) ? rawContributor[0] : rawContributor) as Record<string, unknown> | null;
  if (!c || !c.is_published || !["active", "trialing"].includes(String(c.subscription_status ?? ""))) {
    return null;
  }

  const { data: sections, error: sectionsError } = await sb
    .from("expert_insight_sections")
    .select("id, type, order_index, content")
    .eq("insight_id", String(insight.id))
    .order("order_index", { ascending: true });

  if (sectionsError) throw new Error(sectionsError.message || "EXPERT_SECTIONS_FAILED");

  const contributor = mapContributor(c);
  const mapped = mapInsightRow(insight as Record<string, unknown>, {
    slug: contributor.slug,
    name: contributor.name,
  });

  return {
    insight: {
      ...mapped,
      videoUrl: insight.video_url ? String(insight.video_url) : undefined,
      audioUrl: insight.audio_url ? String(insight.audio_url) : undefined,
    },
    contributor,
    sections: (sections ?? []) as ExpertInsightArticleBundle["sections"],
  };
}
