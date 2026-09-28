import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
  BrandChip,
  BrandStatePanel,
  DepthPressable,
  DepthSurface,
  Eyebrow,
  PosterTitle,
  posterParts,
} from "@/components/gsh-brand";
import { GshScreenShell } from "@/components/GshScreenShell";
import { fetchEmployerFollows, fetchPublicEmployersDirectory } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { resolveDirectoryEmployerLogo } from "@/lib/brand-logo";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { colors, fontFamily, radii } from "@/lib/theme";
import type { PublicEmployerDirectoryRow } from "@/types/models";

type DirectoryView = "all" | "hiring" | "careers";

function isTestCompany(row: PublicEmployerDirectoryRow): boolean {
  const tokens = row.companyName.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return tokens.includes("test") || tokens.includes("testing");
}

export default function CompaniesScreen() {
  const ac = useAccountCopy();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [view, setView] = useState<DirectoryView>("all");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => setSearch(q.trim().toLowerCase()), 250);
    return () => clearTimeout(timeout);
  }, [q]);

  const employersQuery = useQuery({
    queryKey: ["public-employers-directory"],
    queryFn: () => fetchPublicEmployersDirectory(160),
  });
  const followsQuery = useQuery({
    queryKey: ["candidate", "employer-follows"],
    queryFn: fetchEmployerFollows,
    enabled: Boolean(token),
  });

  const allRows = useMemo(
    () => (employersQuery.data?.data ?? []).filter((row) => !isTestCompany(row)),
    [employersQuery.data?.data],
  );
  const rows = useMemo(() => {
    let source = allRows;
    if (view === "hiring") source = source.filter((row) => row.activeJobs > 0);
    else if (view === "careers") source = source.filter((row) => Boolean(row.hasCareersLink));
    if (!search) return source;
    return source.filter((row) =>
      [row.companyName, ...(row.directoryBadges ?? [])].join(" ").toLowerCase().includes(search),
    );
  }, [allRows, search, view]);

  const header = (
    <View style={styles.head}>
      <Eyebrow>{ac("Company directory")}</Eyebrow>
      <PosterTitle {...posterParts(ac("Employers hiring|with us."))} size={34} />
      <Text style={styles.intro}>
        {ac("Every company here has a profile on Global Sponsor Hub. Follow the ones you like to hear about new roles.")}
      </Text>
      <DepthSurface depth={4} radius={18} borderWidth={2} borderColor={colors.navy} innerStyle={styles.search}>
        <Ionicons name="search" size={20} color={colors.navy} />
        <TextInput
          style={styles.searchInput}
          value={q}
          onChangeText={setQ}
          placeholder={ac("Search employers…")}
          placeholderTextColor={colors.placeholder}
          autoCorrect={false}
          returnKeyType="search"
        />
        {q ? (
          <Pressable onPress={() => setQ("")} hitSlop={12} accessibilityRole="button" accessibilityLabel={ac("Clear")}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </DepthSurface>
      <View style={styles.chips}>
        <BrandChip label={ac("All")} selected={view === "all"} onPress={() => setView("all")} />
        <BrandChip label={ac("Hiring now")} selected={view === "hiring"} onPress={() => setView("hiring")} />
        <BrandChip label={ac("Careers page")} selected={view === "careers"} onPress={() => setView("careers")} />
      </View>
      <Pressable
        style={styles.followingRow}
        onPress={() =>
          router.push(
            token ? "/employer-follows" : { pathname: "/login", params: { returnTo: "/employer-follows" } },
          )
        }
        accessibilityRole="button"
      >
        <Ionicons name="heart-outline" size={16} color={colors.navy} />
        <Text style={styles.followingText}>
          {token && followsQuery.data
            ? ac("Companies you follow ({count})", { count: followsQuery.data.length })
            : ac("Companies you follow")}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.navy} />
      </Pressable>
    </View>
  );

  return (
    <GshScreenShell constrainTabletWidth style={styles.shell}>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <FlatList
          data={employersQuery.isError ? [] : rows}
          keyExtractor={(item) => item.employerUserId}
          contentContainerStyle={styles.list}
          ListHeaderComponent={header}
          refreshControl={
            <RefreshControl
              refreshing={employersQuery.isFetching && !employersQuery.isLoading}
              onRefresh={() => void employersQuery.refetch()}
              tintColor={colors.cyan}
            />
          }
          renderItem={({ item }) => {
            const badges = (item.directoryBadges ?? []).slice(0, 3);
            return (
              <DepthPressable
                onPress={() => router.push(`/company/employer/${encodeURIComponent(item.employerUserId)}`)}
                depth={5}
                radius={20}
                borderWidth={2}
                borderColor={colors.navy}
                accessibilityLabel={item.companyName}
                innerStyle={styles.card}
              >
                <View style={styles.logoWell}>
                  <CompanyLogo
                    logoUrl={resolveDirectoryEmployerLogo(item)}
                    companyName={item.companyName}
                    size={56}
                    radius={14}
                  />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.companyName}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {item.activeJobs > 0
                      ? ac("Open roles: {count}", { count: item.activeJobs })
                      : ac("No open roles right now")}
                  </Text>
                  {badges.length > 0 ? (
                    <View style={styles.badgeRow}>
                      {badges.map((badge) => (
                        <Text key={badge} style={styles.badge} numberOfLines={1}>
                          {badge}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
                <View style={styles.arrow}>
                  <Ionicons name="arrow-forward" size={16} color={colors.navy} />
                </View>
              </DepthPressable>
            );
          }}
          ListEmptyComponent={
            employersQuery.isLoading ? (
              <ActivityIndicator style={styles.loading} color={colors.navy} />
            ) : employersQuery.isError ? (
              <BrandStatePanel
                icon="cloud-offline-outline"
                title={ac("Company directory could not be loaded.")}
                body={ac("Check your connection and try again.")}
                primary={{ label: ac("Try again"), icon: "refresh", onPress: () => void employersQuery.refetch() }}
              />
            ) : (
              <BrandStatePanel
                icon="business-outline"
                title={ac("No employers match this search.")}
                body={ac("Try a different name, or show all employers.")}
                primary={{
                  label: ac("Show all"),
                  icon: "close",
                  onPress: () => {
                    setQ("");
                    setView("all");
                  },
                }}
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
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },
  loading: { marginTop: 40 },
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
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  followingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 6,
  },
  followingText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
  },
  logoWell: {
    borderRadius: 16,
    backgroundColor: colors.pale,
    padding: 2,
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: {
    fontSize: 16,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.2,
  },
  cardMeta: {
    marginTop: 3,
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 6, marginTop: 8 },
  badge: {
    overflow: "hidden",
    maxWidth: "100%",
    borderRadius: radii.pill,
    backgroundColor: colors.pale,
    color: colors.navy,
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  arrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
});
