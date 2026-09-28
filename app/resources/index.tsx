import { useDeferredValue, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BrandChip,
  BrandLinkRow,
  BrandStatePanel,
  DepthSurface,
  Eyebrow,
  PosterTitle,
  posterParts,
  SectionHeading,
} from "@/components/gsh-brand";
import { GshScreenShell } from "@/components/GshScreenShell";
import { fetchPublishedExpertInsights } from "@/lib/content/expertInsightQueries";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { RESOURCE_LIBRARY, type ResourceItem, type ResourceKind } from "@/lib/resourceLibrary";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { colors, fontFamily } from "@/lib/theme";
import { useTemplateSaves } from "@/lib/useTemplateSaves";

const KIND_FILTERS: { value: ResourceKind | "all"; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "guides", label: "Guides" },
  { value: "tools", label: "Tools" },
  { value: "templates", label: "Templates" },
  { value: "updates", label: "Updates" },
];

export default function ResourcesScreen() {
  const ac = useAccountCopy();
  const router = useRouter();
  const saves = useTemplateSaves("/resources");
  const [query, setQuery] = useState("");
  const search = useDeferredValue(query).trim().toLowerCase();
  const [kind, setKind] = useState<ResourceKind | "all">("all");

  const articlesQuery = useQuery({
    queryKey: ["expert-insights"],
    queryFn: fetchPublishedExpertInsights,
    staleTime: 300_000,
    retry: false,
  });

  const items = useMemo(() => {
    const articles: ResourceItem[] = (articlesQuery.data ?? []).map((article) => ({
      id: `article-${article.id}`,
      kind: "updates",
      format: "Article",
      title: article.title,
      blurb: article.excerpt,
      href: `/resources/articles/${article.slug}`,
    }));
    return [...RESOURCE_LIBRARY, ...articles].filter((item) => {
      if (kind !== "all" && item.kind !== kind) return false;
      if (!search) return true;
      return [ac(item.title), ac(item.blurb), ac(item.format)].some((value) => value.toLowerCase().includes(search));
    });
  }, [ac, articlesQuery.data, kind, search]);

  return (
    <GshScreenShell constrainTabletWidth style={styles.shell}>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.pad}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Eyebrow>{ac("Resources")}</Eyebrow>
          <PosterTitle {...posterParts(ac("Answers for|every step."))} size={34} />
          <Text style={styles.intro}>
            {ac("Tools, templates, destination research and reliable updates for each decision before, during or after an international move. We do not run the move.")}
          </Text>

          <DepthSurface depth={4} radius={18} borderWidth={2} borderColor={colors.navy} innerStyle={styles.search}>
            <Ionicons name="search" size={18} color={colors.navy} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={ac("Search guides, tools, templates and updates")}
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {KIND_FILTERS.map((filter) => (
              <BrandChip
                key={filter.value}
                label={ac(filter.label)}
                selected={kind === filter.value}
                onPress={() => setKind(filter.value)}
              />
            ))}
          </ScrollView>

          {kind === "all" && !search ? (
            <>
              <SectionHeading title={ac("Your workspace")} style={styles.sectionGap} />
              <BrandLinkRow
                icon="list-outline"
                label={ac("Application tracker")}
                hint={ac("Track companies, jobs, destinations and progress in your account.")}
                onPress={() => router.push("/application-tracker")}
              />
              <BrandLinkRow
                icon="bookmark-outline"
                label={ac("Saved resources")}
                hint={saves.signedIn ? ac("Saved: {count}", { count: saves.count }) : ac("Sign in to save resources")}
                onPress={() =>
                  router.push(
                    saves.signedIn ? "/saved-resources" : { pathname: "/login", params: { returnTo: "/saved-resources" } },
                  )
                }
              />
              <SectionHeading title={ac("Search the library")} style={styles.sectionGap} />
            </>
          ) : null}

          {saves.failed ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {ac("Could not update resources")}. {ac("Please try again.")}
            </Text>
          ) : null}
          <Text style={styles.srOnly} accessibilityLiveRegion="polite">
            {ac("{count} resources match the current filters.", { count: items.length })}
          </Text>

          {items.length ? (
            items.map((item) => {
              const templateSlug = item.templateSlug;
              const saved = templateSlug ? saves.isSaved(templateSlug) : false;
              return (
                <DepthSurface key={item.id} depth={4} radius={20} borderWidth={2} borderColor={colors.navy} innerStyle={styles.row}>
                  <Pressable
                    style={({ pressed }) => [styles.rowMain, pressed && styles.rowPressed]}
                    onPress={() => router.push(item.href)}
                    accessibilityRole="button"
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowFormat}>{ac(item.format)}</Text>
                      <Text style={styles.rowTitle}>{ac(item.title)}</Text>
                      {item.blurb ? (
                        <Text style={styles.rowBlurb} numberOfLines={3}>
                          {ac(item.blurb)}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.navy} />
                  </Pressable>
                  {templateSlug ? (
                    <Pressable
                      style={styles.saveButton}
                      onPress={() => saves.toggle(templateSlug, item.title)}
                      disabled={saves.busy}
                      accessibilityLabel={`${ac(saved ? "Remove" : "Save")}: ${ac(item.title)}`}
                    >
                      <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={18} color={colors.navy} />
                      <Text style={[styles.saveText, saved && styles.saveTextActive]}>
                        {saved ? ac("Saved") : ac("Save")}
                      </Text>
                    </Pressable>
                  ) : null}
                </DepthSurface>
              );
            })
          ) : (
            <BrandStatePanel
              icon="search-outline"
              title={ac("Nothing matches those filters.")}
              body={ac("Try a broader question or return to the complete library.")}
              primary={{
                label: ac("Clear filters"),
                icon: "close",
                onPress: () => {
                  setQuery("");
                  setKind("all");
                },
              }}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  shell: { backgroundColor: colors.white },
  pad: { ...stackScrollContentStyle, gap: 12, paddingBottom: 40 },
  intro: { fontSize: 15, lineHeight: 22, fontFamily: fontFamily.regular, color: colors.textSecondary },
  search: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  searchInput: { flex: 1, minHeight: 48, fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.navy },
  filters: { gap: 8, paddingTop: 2, paddingBottom: 6 },
  sectionGap: { marginTop: 12 },
  error: { color: colors.error, fontFamily: fontFamily.semiBold, fontSize: 13 },
  srOnly: { position: "absolute", width: 1, height: 1, opacity: 0 },
  row: { overflow: "hidden" },
  rowMain: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  rowPressed: { backgroundColor: colors.pale },
  rowFormat: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  rowTitle: { marginTop: 3, fontSize: 16, lineHeight: 21, fontFamily: fontFamily.heading, color: colors.navy },
  rowBlurb: { marginTop: 4, fontSize: 13, lineHeight: 19, fontFamily: fontFamily.regular, color: colors.textSecondary },
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
