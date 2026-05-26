export type ExpertInsightsContentKind = "brief" | "flagship" | "evergreen";
export type ExpertInsightsFormatSlug = "article" | "video" | "podcast";
export type ExpertInsightsCategorySlug =
  | "visa-sponsorship"
  | "relocation"
  | "hiring-mobility"
  | "policy"
  | "careers";

export type ExpertContributorPublic = {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string;
  avatarInitials?: string;
  accentClass?: string;
  expertise: string[];
  websiteUrl?: string;
  websiteLabel?: string;
};

export type ExpertInsightPublic = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  format: ExpertInsightsFormatSlug;
  kind: ExpertInsightsContentKind;
  categorySlug: ExpertInsightsCategorySlug;
  contributorSlug: string;
  publishedAt: string;
  readMinutes?: number;
  featured: boolean;
  contributor_slug: string;
  contributor_name: string;
};

export type ExpertInsightSectionRow = {
  id: string;
  type: string;
  order_index: number;
  content: Record<string, unknown>;
};

export type ExpertInsightArticleBundle = {
  insight: ExpertInsightPublic & { videoUrl?: string; audioUrl?: string };
  contributor: ExpertContributorPublic;
  sections: ExpertInsightSectionRow[];
};
