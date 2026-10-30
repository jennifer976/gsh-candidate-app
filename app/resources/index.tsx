import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "@/components/Icon";
import { BrandStatePanel, TitleWithStop } from "@/components/gsh-brand";
import { Card, SectionHeader, Tile } from "@/components/v3";
import { fetchPublishedBlogList } from "@/lib/content/blogQueries";
import { fetchPublishedExpertInsights } from "@/lib/content/expertInsightQueries";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { RESOURCE_LIBRARY, type ResourceItem } from "@/lib/resourceLibrary";
import { colors, fontFamily, shadows } from "@/lib/theme";
import { useTemplateSaves } from "@/lib/useTemplateSaves";

type TopicId = "visas" | "family" | "remote" | "templates";

/** Tools, countries, news and the blog have their own screens, so the library keeps to guides and templates. */
const LIBRARY_EXCLUDED_IDS = new Set(["countries", "compare", "news", "blog"]);

const TOPICS: { id: TopicId; label: string; icon: IconName }[] = [
  { id: "visas", label: "Visas and sponsorship", icon: "plane" },
  { id: "family", label: "Moving with family", icon: "users-round" },
  { id: "remote", label: "Remote work", icon: "globe" },
  { id: "templates", label: "Templates", icon: "file-text" },
];

function matchesTopic(item: ResourceItem, topic: TopicId): boolean {
  if (topic === "templates") return item.kind === "templates";
  if (item.kind !== "guides") return false;
  const text = `${item.title} ${item.blurb ?? ""}`.toLowerCase();
  if (topic === "visas") return text.includes("visa") || text.includes("sponsor");
  if (topic === "family") return text.includes("family");
  return text.includes("remote");
}

export default function ResourcesScreen() {
  const ac = useAccountCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const saves = useTemplateSaves("/resources");
  const [query, setQuery] = useState("");
  const search = useDeferredValue(query).trim().toLowerCase();
  const [topic, setTopic] = useState<TopicId | null>(null);

  const articlesQuery = useQuery({
    queryKey: ["expert-insights"],
    queryFn: fetchPublishedExpertInsights,
    staleTime: 300_000,
    retry: false,
  });
  const blogQuery = useQuery({
    queryKey: ["blogs", "published"],
    queryFn: fetchPublishedBlogList,
    staleTime: 300_000,
    retry: false,
  });
  const posts = (blogQuery.data ?? []).slice(0, 3);

  const library = useMemo(() => {
    const articles: ResourceItem[] = (articlesQuery.data ?? []).map((article) => ({
      id: `article-${article.id}`,
      kind: "guides",
      format: "Article",
      title: article.title,
      blurb: article.excerpt,
      href: `/resources/articles/${article.slug}`,
    }));
    return [...RESOURCE_LIBRARY, ...articles].filter(
      (item) => item.kind !== "tools" && item.kind !== "updates" && !LIBRARY_EXCLUDED_IDS.has(item.id),
    );
  }, [articlesQuery.data]);

  const filtered = useMemo(
    () =>
      library.filter((item) => {
        if (topic && !matchesTopic(item, topic)) return false;
        if (!search) return true;
        return [ac(item.title), ac(item.blurb ?? ""), ac(item.format)].some((v) =>
          v.toLowerCase().includes(search),
        );
      }),
    [ac, library, search, topic],
  );

  const narrowed = Boolean(search) || topic !== null;
  const topicLabel = topic ? ac(TOPICS.find((row) => row.id === topic)?.label ?? "") : "";

  const clear = () => {
    setQuery("");
    setTopic(null);
  };

  const openSaved = () =>
    router.push(
      saves.signedIn
        ? "/saved-resources"
        : { pathname: "/login", params: { returnTo: "/saved-resources" } },
    );

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/tools-resources");
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 22,
          paddingBottom: Math.max(insets.bottom, 16) + 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.pad}>
          <Pressable
            onPress={goBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Icon name="arrow-left" size={22} color={colors.navy} strokeWidth={1.8} />
          </Pressable>

          <View style={{ marginTop: 16 }}>
            <TitleWithStop eyebrow={ac("Guides and templates")} text={ac("Resources")} />
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchPill}>
              <Icon name="search" size={20} color={colors.navy} strokeWidth={1.8} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={ac("Search visas, family moves, templates…")}
                placeholderTextColor={colors.placeholder}
                style={styles.searchInput}
                accessibilityLabel={ac("Search resources")}
                returnKeyType="search"
              />
              {query ? (
                <Pressable onPress={() => setQuery("")} hitSlop={10} accessibilityLabel={ac("Clear filters")}>
                  <Icon name="x" size={18} color={colors.muted} strokeWidth={1.8} />
                </Pressable>
              ) : null}
            </View>
            <Pressable
              onPress={openSaved}
              style={styles.bookmarkBtn}
              accessibilityRole="button"
              accessibilityLabel={
                saves.signedIn
                  ? `${ac("Saved resources")}. ${ac("Saved: {count}", { count: saves.count })}`
                  : ac("Saved resources")
              }
            >
              <Icon name="bookmark" size={20} color={colors.navy} strokeWidth={1.8} />
            </Pressable>
          </View>
        </View>

        {narrowed ? (
          <View style={styles.pad}>
            <View style={styles.resultHead}>
              <Text style={styles.resultTitle} numberOfLines={1}>
                {topicLabel || ac("Search results")}
              </Text>
              <Pressable onPress={clear} style={styles.clearPill} accessibilityRole="button">
                <Icon name="x" size={14} color={colors.navy} strokeWidth={1.8} />
                <Text style={styles.clearText}>{ac("Clear filters")}</Text>
              </Pressable>
            </View>
            <Text style={styles.srOnly} accessibilityLiveRegion="polite">
              {ac("{count} resources match the current filters.", { count: filtered.length })}
            </Text>
            {filtered.length ? (
              <LibraryList items={filtered} saves={saves} onOpen={(item) => router.push(item.href)} />
            ) : (
              <BrandStatePanel
                icon="search-outline"
                title={ac("Nothing matches those filters.")}
                body={ac("Try a broader question or return to the complete library.")}
                primary={{ label: ac("Clear filters"), icon: "close", onPress: clear }}
              />
            )}
          </View>
        ) : (
          <>
            <View style={[styles.pad, styles.section]}>
              <View style={styles.grid}>
                {TOPICS.map((row) => (
                  <Tile
                    key={row.id}
                    icon={row.icon}
                    title={ac(row.label)}
                    onPress={() => setTopic(row.id)}
                    style={styles.tile}
                  />
                ))}
              </View>
            </View>

            {posts.length > 0 ? (
              <View style={[styles.pad, styles.section]}>
                <Card padding={0}>
                  <Pressable
                    onPress={() => router.push("/blog")}
                    style={styles.blogHead}
                    accessibilityRole="button"
                    accessibilityLabel={`${ac("Latest insights")}. ${ac("See all")}`}
                  >
                    <Text style={styles.blogHeadText}>{ac("Latest insights")}</Text>
                    <View style={styles.seeAll}>
                      <Text style={styles.seeAllText}>{ac("See all")}</Text>
                      <Icon name="chevron-right" size={18} color={colors.text2} strokeWidth={1.8} />
                    </View>
                  </Pressable>
                  {posts.map((post, index) => (
                    <Pressable
                      key={post.id}
                      onPress={() => router.push(`/blog/${encodeURIComponent(post.slug)}`)}
                      style={({ pressed }) => [
                        styles.blogRow,
                        index > 0 && styles.blogRowBorder,
                        pressed && styles.rowPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={post.title}
                    >
                      <Text style={styles.blogIndex}>{String(index + 1).padStart(2, "0")}</Text>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.blogTitle} numberOfLines={2}>
                          {post.title}
                        </Text>
                        {post.category?.name ? (
                          <Text style={styles.blogMeta}>{post.category.name}</Text>
                        ) : null}
                      </View>
                    </Pressable>
                  ))}
                </Card>
              </View>
            ) : null}

            <View style={[styles.pad, styles.section]}>
              <SectionHeader
                eyebrow={ac("Everything in one place")}
                title={ac("All guides and templates")}
              />
              {saves.failed ? (
                <Text accessibilityRole="alert" style={styles.error}>
                  {ac("Could not update resources")}. {ac("Please try again.")}
                </Text>
              ) : null}
              <LibraryList items={library} saves={saves} onOpen={(item) => router.push(item.href)} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function LibraryList({
  items,
  saves,
  onOpen,
}: {
  items: ResourceItem[];
  saves: ReturnType<typeof useTemplateSaves>;
  onOpen: (item: ResourceItem) => void;
}) {
  const ac = useAccountCopy();
  return (
    <View style={styles.list}>
      {items.map((item) => {
        const templateSlug = item.templateSlug;
        const saved = templateSlug ? saves.isSaved(templateSlug) : false;
        return (
          <Card key={item.id} padding={18} style={styles.guideCard}>
            <Pressable
              style={({ pressed }) => [styles.rowMain, pressed && styles.rowPressed]}
              onPress={() => onOpen(item)}
              accessibilityRole="button"
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.formatRow}>
                  <View style={styles.formatBar} />
                  <Text style={styles.rowFormat}>{ac(item.format)}</Text>
                </View>
                <Text style={styles.rowTitle}>{ac(item.title)}</Text>
                {item.blurb ? (
                  <Text style={styles.rowBlurb} numberOfLines={2}>
                    {ac(item.blurb)}
                  </Text>
                ) : null}
              </View>
              <Icon name="chevron-right" size={18} color={colors.muted} strokeWidth={1.8} />
            </Pressable>
            {templateSlug ? (
              <Pressable
                style={styles.saveButton}
                onPress={() => saves.toggle(templateSlug, item.title)}
                disabled={saves.busy}
                accessibilityLabel={`${ac(saved ? "Remove" : "Save")}: ${ac(item.title)}`}
              >
                <Icon name="bookmark" size={18} color={colors.navy} strokeWidth={1.8} />
                <Text style={styles.saveText}>{saved ? ac("Saved") : ac("Save")}</Text>
              </Pressable>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.panel },
  pad: { paddingHorizontal: 16 },
  section: { marginTop: 28 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  searchRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchPill: {
    flex: 1,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.white,
    ...shadows.card,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
  },
  bookmarkBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  resultHead: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resultTitle: {
    flex: 1,
    fontSize: 19,
    fontFamily: fontFamily.heading,
    color: colors.navy,
  },
  clearPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.white,
  },
  clearText: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.navy },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "47%", flexGrow: 1 },
  blogHead: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  blogHeadText: {
    fontFamily: fontFamily.heading,
    fontSize: 17,
    color: colors.navy,
  },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 2, minHeight: 44 },
  seeAllText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.text2,
  },
  blogRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  blogRowBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  blogIndex: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 22,
    color: "#dfe3ec",
  },
  blogTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.navy,
  },
  blogMeta: {
    marginTop: 2,
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.muted,
  },
  error: {
    color: colors.error,
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    marginTop: 8,
  },
  srOnly: { position: "absolute", width: 1, height: 1, opacity: 0 },
  list: { marginTop: 12, gap: 12 },
  guideCard: {},
  rowMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowPressed: { opacity: 0.85 },
  formatRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  formatBar: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.cyan,
  },
  rowFormat: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.text2,
    textTransform: "none",
  },
  rowTitle: {
    marginTop: 6,
    fontFamily: fontFamily.heading,
    fontSize: 17,
    lineHeight: 22,
    color: colors.navy,
  },
  rowBlurb: {
    marginTop: 4,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text2,
  },
  saveButton: {
    marginTop: 12,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 12,
  },
  saveText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
});
