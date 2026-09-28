import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CompanyLogo } from "@/components/CompanyLogo";
import {
  BrandStatePanel,
  DepthPressable,
  DepthSurface,
  Eyebrow,
  PosterTitle,
  posterParts,
} from "@/components/gsh-brand";
import { GshScreenShell } from "@/components/GshScreenShell";
import { fetchPartners } from "@/lib/api-client";
import { resolvePartnerListLogo } from "@/lib/brand-logo";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { colors, fontFamily, radii } from "@/lib/theme";
import type { PartnerListItem } from "@/types/models";

export default function PartnersScreen() {
  const ac = useAccountCopy();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  const query = useQuery({
    queryKey: ["partners", debounced],
    queryFn: () =>
      fetchPartners({
        q: debounced || undefined,
        page: 1,
        perPage: 40,
      }),
  });

  const rows = query.data?.data ?? [];

  const header = (
    <View style={styles.head}>
      <Eyebrow>{ac("Specialist directory")}</Eyebrow>
      <PosterTitle {...posterParts(ac("Help with|the move."))} size={34} />
      <Text style={styles.intro}>
        {ac(
          "Independent visa, housing and relocation help. Listing is free for them. You request — they pay only if they accept. We do not run the move.",
        )}
      </Text>
      <DepthSurface depth={4} radius={18} borderWidth={2} borderColor={colors.navy} innerStyle={styles.search}>
        <Ionicons name="search" size={20} color={colors.navy} />
        <TextInput
          style={styles.searchInput}
          placeholder={ac("Search specialists and services")}
          placeholderTextColor={colors.placeholder}
          value={q}
          onChangeText={setQ}
          autoCorrect={false}
          returnKeyType="search"
        />
        {q ? (
          <Pressable onPress={() => setQ("")} hitSlop={12} accessibilityRole="button" accessibilityLabel={ac("Clear")}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </DepthSurface>
    </View>
  );

  return (
    <GshScreenShell constrainTabletWidth style={styles.shell}>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <FlatList
          data={query.isError ? [] : rows}
          keyExtractor={(item: PartnerListItem) => String(item._id ?? item.userId ?? item.businessName)}
          refreshControl={
            <RefreshControl
              refreshing={query.isFetching && !query.isLoading}
              onRefresh={() => void query.refetch()}
              tintColor={colors.cyan}
            />
          }
          contentContainerStyle={styles.list}
          ListHeaderComponent={header}
          renderItem={({ item }) => (
            <DepthPressable
              onPress={() => item._id && router.push(`/partner/${item._id}`)}
              disabled={!item._id}
              depth={5}
              radius={20}
              borderWidth={2}
              borderColor={colors.navy}
              accessibilityLabel={`${ac("View specialist profile")}: ${item.businessName}`}
              innerStyle={styles.card}
            >
              <View style={styles.cardTop}>
                <View style={styles.logoWell}>
                  <CompanyLogo
                    logoUrl={resolvePartnerListLogo(item)}
                    companyName={item.businessName}
                    size={56}
                    radius={14}
                  />
                </View>
                <View style={styles.cardTopText}>
                  <Text style={styles.title} numberOfLines={2}>
                    {item.businessName}
                  </Text>
                  {item.category ? (
                    <Text style={styles.category} numberOfLines={1}>
                      {item.category}
                    </Text>
                  ) : null}
                </View>
              </View>
              {item.companyDescription ? (
                <Text style={styles.desc} numberOfLines={3}>
                  {item.companyDescription}
                </Text>
              ) : null}
              <View style={styles.footer}>
                {item.companyWebsite ? (
                  <Pressable
                    onPress={() => {
                      const raw = item.companyWebsite.startsWith("http")
                        ? item.companyWebsite
                        : `https://${item.companyWebsite}`;
                      try {
                        openExternalUrlInApp(raw);
                      } catch {
                        /* invalid URL */
                      }
                    }}
                    hitSlop={8}
                    accessibilityRole="link"
                    style={styles.websiteLink}
                  >
                    <Ionicons name="globe-outline" size={15} color={colors.navy} />
                    <Text style={styles.websiteText}>{ac("Company website")}</Text>
                  </Pressable>
                ) : (
                  <View />
                )}
                {item._id ? (
                  <View style={styles.ctaRow}>
                    <Text style={styles.ctaText}>{ac("View profile")}</Text>
                    <View style={styles.ctaArrow}>
                      <Ionicons name="arrow-forward" size={14} color={colors.navy} />
                    </View>
                  </View>
                ) : null}
              </View>
            </DepthPressable>
          )}
          ListEmptyComponent={
            query.isLoading ? (
              <ActivityIndicator style={styles.loading} color={colors.navy} />
            ) : query.isError ? (
              <BrandStatePanel
                icon="cloud-offline-outline"
                title={ac("The specialist directory could not be loaded.")}
                body={ac("Please try again.")}
                primary={{ label: ac("Try again"), icon: "refresh", onPress: () => void query.refetch() }}
              />
            ) : (
              <BrandStatePanel
                icon="people-outline"
                title={ac("No specialists match your search.")}
                body={ac("Try a different word, like visa, housing or tax.")}
                primary={{ label: ac("Show all"), icon: "close", onPress: () => setQ("") }}
              />
            )
          }
        />
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: colors.white },
  safe: { flex: 1 },
  head: { paddingTop: 16, paddingBottom: 6, gap: 12 },
  intro: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.navy,
  },
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },
  loading: { marginTop: 40 },
  card: { padding: 16 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoWell: { borderRadius: 16, backgroundColor: colors.pale, padding: 2 },
  cardTopText: { flex: 1, minWidth: 0 },
  title: {
    fontSize: 17,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.2,
  },
  category: {
    alignSelf: "flex-start",
    overflow: "hidden",
    marginTop: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  desc: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  websiteLink: { flexDirection: "row", alignItems: "center", gap: 6 },
  websiteText: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.navy },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ctaText: { fontSize: 14, fontFamily: fontFamily.bold, color: colors.navy },
  ctaArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
});
