import { useDeferredValue, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BrandStatePanel,
  DepthPressable,
  DepthSurface,
  Eyebrow,
  PosterTitle,
  posterParts,
  SectionHeading,
} from "@/components/gsh-brand";
import { GshHomeDestinationRail } from "@/components/GshHomeDestinationRail";
import { GshScreenShell } from "@/components/GshScreenShell";
import { fetchPublishedBlogList } from "@/lib/content/blogQueries";
import { fetchPublishedExpertInsights } from "@/lib/content/expertInsightQueries";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { PUBLIC_COUNTRIES } from "@/lib/publicResources";
import { RESOURCE_LIBRARY, type ResourceItem } from "@/lib/resourceLibrary";
import { colors, fontFamily } from "@/lib/theme";
import { useTemplateSaves } from "@/lib/useTemplateSaves";

type IonName = keyof typeof Ionicons.glyphMap;
type TopicId = "visas" | "family" | "remote" | "templates";

/** Tools, countries, news and the blog have their own screens, so the library keeps to guides and templates. */
const LIBRARY_EXCLUDED_IDS = new Set(["countries", "compare", "news", "blog"]);

const TOPICS: { id: TopicId; label: string; icon: IonName; navy: boolean }[] = [
  { id: "visas", label: "Visas and sponsorship", icon: "airplane", navy: false },
  { id: "family", label: "Moving with family", icon: "people", navy: true },
  { id: "remote", label: "Remote work", icon: "laptop", navy: true },
  { id: "templates", label: "Templates", icon: "document-text", navy: false },
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
        return [ac(item.title), ac(item.blurb ?? ""), ac(item.format)].some((v) => v.toLowerCase().includes(search));
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
    router.push(saves.signedIn ? "/saved-resources" : { pathname: "/login", params: { returnTo: "/saved-resources" } });

  return (
    <GshScreenShell constrainTabletWidth style={styles.shell}>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.pad}>
            <View style={styles.headRow}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Eyebrow>{ac("Guides and blog")}</Eyebrow>
                <PosterTitle {...posterParts(ac("Know before|you go."))} highlightTone="cyan" size={34} />
              </View>
              <Pressable
                onPress={openSaved}
                style={styles.roundButton}
                accessibilityRole="button"
                accessibilityLabel={
                  saves.signedIn ? `${ac("Saved resources")}. ${ac("Saved: {count}", { count: saves.count })}` : ac("Saved resources")
                }
              >
                <Ionicons name="bookmark-outline" size={20} color={colors.navy} />
              </Pressable>
            </View>

            <DepthSurface depth={4} radius={18} borderWidth={2} borderColor={colors.navy} style={styles.searchWrap} innerStyle={styles.search}>
              <Ionicons name="search" size={20} color={colors.navy} />
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
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </DepthSurface>
          </View>

          {narrowed ? (
            <View style={styles.pad}>
              <View style={styles.resultHead}>
                <Text style={styles.resultTitle} numberOfLines={1}>
                  {topicLabel || ac("Search results")}
                </Text>
                <Pressable onPress={clear} style={styles.clearPill} accessibilityRole="button">
                  <Ionicons name="close" size={14} color={colors.navy} />
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
              <View style={styles.section}>
                <GshHomeDestinationRail
                  opens="guide"
                  eyebrow={ac("Visa routes and everyday life")}
                  title={ac("Country guides")}
                  actionLabel={ac("All {count}", { count: PUBLIC_COUNTRIES.length })}
                />
              </View>

              <View style={[styles.pad, styles.section]}>
                <SectionHeading title={ac("Browse by topic")} />
                <View style={styles.topicGrid}>
                  {TOPICS.map((row) => (
                    <DepthPressable
                      key={row.id}
                      onPress={() => setTopic(row.id)}
                      face={row.navy ? colors.navy : colors.cyan}
                      depthColor={row.navy ? colors.cyan : colors.navy}
                      depth={4}
                      radius={20}
                      accessibilityLabel={ac(row.label)}
                      style={styles.topic}
                      innerStyle={styles.topicInner}
                    >
                      <View style={[styles.topicIcon, { backgroundColor: row.navy ? colors.cyan : colors.navy }]}>
                        <Ionicons name={row.icon} size={18} color={row.navy ? colors.navy : colors.cyan} />
                      </View>
                      <Text style={[styles.topicLabel, row.navy && styles.topicLabelOnNavy]} numberOfLines={2}>
                        {ac(row.label)}
                      </Text>
                    </DepthPressable>
                  ))}
                </View>
              </View>

              {posts.length > 0 ? (
                <View style={[styles.pad, styles.section]}>
                  <View style={styles.blogBox}>
                    <Pressable
                      onPress={() => router.push("/blog")}
                      style={styles.blogHead}
                      accessibilityRole="button"
                      accessibilityLabel={`${ac("Latest from the blog")}. ${ac("See all")}`}
                    >
                      <Text style={styles.blogHeadText}>{ac("Latest from the blog")}</Text>
                      <Ionicons name="newspaper" size={18} color={colors.navy} />
                    </Pressable>
                    {posts.map((post, index) => (
                      <Pressable
                        key={post.id}
                        onPress={() => router.push(`/blog/${encodeURIComponent(post.slug)}`)}
                        style={({ pressed }) => [styles.blogRow, index > 0 && styles.blogRowBorder, pressed && styles.rowPressed]}
                        accessibilityRole="button"
                        accessibilityLabel={post.title}
                      >
                        <Text style={styles.blogIndex}>{String(index + 1).padStart(2, "0")}</Text>
                        <Text style={styles.blogTitle} numberOfLines={2}>
                          {post.title}
                        </Text>
                        {post.category?.name ? <Text style={styles.blogMeta}>{post.category.name}</Text> : null}
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <View style={[styles.pad, styles.section]}>
                <SectionHeading title={ac("All guides and templates")} />
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
      </SafeAreaView>
    </GshScreenShell>
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
          <DepthSurface key={item.id} depth={4} radius={20} borderWidth={2} borderColor={colors.navy} innerStyle={styles.row}>
            <Pressable
              style={({ pressed }) => [styles.rowMain, pressed && styles.rowPressed]}
              onPress={() => onOpen(item)}
              accessibilityRole="button"
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowFormat}>{ac(item.format)}</Text>
                <Text style={styles.rowTitle}>{ac(item.title)}</Text>
                {item.blurb ? (
                  <Text style={styles.rowBlurb} numberOfLines={2}>
                    {ac(item.blurb)}
                  </Text>
                ) : null}
              </View>
              <View style={styles.rowArrow}>
                <Ionicons name="chevron-forward" size={16} color={colors.navy} />
              </View>
            </Pressable>
            {templateSlug ? (
              <Pressable
                style={styles.saveButton}
                onPress={() => saves.toggle(templateSlug, item.title)}
                disabled={saves.busy}
                accessibilityLabel={`${ac(saved ? "Remove" : "Save")}: ${ac(item.title)}`}
              >
                <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={18} color={colors.navy} />
                <Text style={[styles.saveText, saved && styles.saveTextActive]}>{saved ? ac("Saved") : ac("Save")}</Text>
              </Pressable>
            ) : null}
          </DepthSurface>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  shell: { backgroundColor: colors.white },
  scroll: { paddingTop: 16, paddingBottom: 40 },
  pad: { paddingHorizontal: 20 },
  section: { marginTop: 28 },
  headRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: { marginTop: 20 },
  search: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16 },
  searchInput: { flex: 1, minHeight: 48, fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.navy },
  resultHead: { marginTop: 24, marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  resultTitle: { flex: 1, fontSize: 19, fontFamily: fontFamily.heading, color: colors.navy },
  clearPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.pale,
  },
  clearText: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.navy },
  topicGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 12 },
  topic: { width: "47%", flexGrow: 1 },
  topicInner: { padding: 14, minHeight: 104 },
  topicIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  topicLabel: { marginTop: 10, fontSize: 14, lineHeight: 18, fontFamily: fontFamily.heading, color: colors.navy },
  topicLabelOnNavy: { color: colors.white },
  blogBox: { borderRadius: 22, borderWidth: 2, borderColor: colors.navy, overflow: "hidden", backgroundColor: colors.white },
  blogHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cyan,
    borderBottomWidth: 2,
    borderBottomColor: colors.navy,
  },
  blogHeadText: { fontSize: 15, fontFamily: fontFamily.heading, color: colors.navy },
  blogRow: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  blogRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  blogIndex: { fontSize: 22, fontFamily: fontFamily.headingStrong, color: colors.navy, opacity: 0.35 },
  blogTitle: { flex: 1, fontSize: 13, lineHeight: 19, fontFamily: fontFamily.bold, color: colors.navy },
  blogMeta: { fontSize: 10, fontFamily: fontFamily.bold, color: colors.textMuted },
  error: { color: colors.error, fontFamily: fontFamily.semiBold, fontSize: 13, marginTop: 8 },
  srOnly: { position: "absolute", width: 1, height: 1, opacity: 0 },
  list: { marginTop: 12, gap: 12 },
  row: { overflow: "hidden" },
  rowMain: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  rowPressed: { backgroundColor: colors.pale },
  rowFormat: { fontSize: 11, fontFamily: fontFamily.bold, letterSpacing: 1.2, textTransform: "uppercase", color: colors.textMuted },
  rowTitle: { marginTop: 3, fontSize: 16, lineHeight: 21, fontFamily: fontFamily.heading, color: colors.navy },
  rowBlurb: { marginTop: 4, fontSize: 13, lineHeight: 19, fontFamily: fontFamily.regular, color: colors.textSecondary },
  rowArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderTopWidth: 2,
    borderTopColor: colors.navy,
  },
  saveText: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textMuted },
  saveTextActive: { color: colors.navy, fontFamily: fontFamily.bold },
});
