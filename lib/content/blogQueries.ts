import { getPublicSupabase } from "@/lib/supabasePublic";

/** Thrown when blog env vars are missing — UI should offer the website blog instead. */
export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super("SUPABASE_NOT_CONFIGURED");
    this.name = "SupabaseNotConfiguredError";
  }
}

export type BlogListRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  featured_image: string | null;
  created_at: string;
  category?: { name: string; slug: string } | null;
};

export type BlogSectionRow = {
  id: string;
  type: string;
  order_index: number;
  content: Record<string, unknown>;
};

type BlogListRaw = Omit<BlogListRow, "category"> & {
  category: { name: string; slug: string } | { name: string; slug: string }[] | null | undefined;
};

export async function fetchPublishedBlogList(): Promise<BlogListRow[]> {
  const sb = getPublicSupabase();
  if (!sb) throw new SupabaseNotConfiguredError();
  const { data, error } = await sb
    .from("blogs")
    .select(`id, title, slug, description, featured_image, created_at, category:categories(name, slug)`)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message || "BLOG_LIST_FAILED");
  if (!data) return [];
  return (data as BlogListRaw[]).map((row): BlogListRow => {
    const c = row.category;
    const category = Array.isArray(c) ? (c[0] ?? null) : (c ?? null);
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      featured_image: row.featured_image,
      created_at: row.created_at,
      category,
    };
  });
}

export async function fetchBlogArticleBySlug(slug: string): Promise<{
  blog: BlogListRow & { author_byline?: string | null };
  sections: BlogSectionRow[];
} | null> {
  const sb = getPublicSupabase();
  if (!sb) throw new SupabaseNotConfiguredError();
  const { data: blog, error: blogError } = await sb
    .from("blogs")
    .select(`*, category:categories(name, slug)`)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (blogError) throw new Error(blogError.message || "BLOG_ARTICLE_FAILED");
  if (!blog) return null;

  const braw = blog as BlogListRaw & { author_byline?: string | null };
  const c = braw.category;
  const categoryNorm = Array.isArray(c) ? (c[0] ?? null) : (c ?? null);
  const blogNorm = { ...braw, category: categoryNorm } as BlogListRow & { author_byline?: string | null };

  const { data: sections, error: sectionsError } = await sb
    .from("blog_sections")
    .select("id, type, order_index, content")
    .eq("blog_id", (blog as { id: string }).id)
    .order("order_index", { ascending: true });

  if (sectionsError) throw new Error(sectionsError.message || "BLOG_SECTIONS_FAILED");

  return {
    blog: blogNorm,
    sections: (sections ?? []) as BlogSectionRow[],
  };
}
