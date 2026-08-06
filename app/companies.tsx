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
import { GshDarkFeedHeading } from "@/components/GshDarkFeedHeading";
import { GshScreenShell } from "@/components/GshScreenShell";
import { fetchPublicEmployersDirectory, fetchPublicSponsorCompanies } from "@/lib/api-client";
import { getMarketingSiteUrl } from "@/lib/config";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { stackFlatListHeadWrapStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { PublicEmployerDirectoryRow, SponsorCompany } from "@/types/models";

type DirectoryTab = "employers" | "register";

export default function CompaniesScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<DirectoryTab>("employers");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => setSearch(q.trim().toLowerCase()), 350);
    return () => clearTimeout(timeout);
  }, [q]);

  const employersQuery = useQuery({
    queryKey: ["public-employers-directory"],
    queryFn: () => fetchPublicEmployersDirectory(160),
  });
  const sponsorQuery = useQuery({
    queryKey: ["sponsor-companies", search],
    queryFn: () => fetchPublicSponsorCompanies({ q: search || undefined, page: 1, perPage: 50 }),
    enabled: tab === "register",
  });

  const employerRows = useMemo(() => {
    const rows = employersQuery.data?.data ?? [];
    if (!search) return rows;
    return rows.filter((row) =>
      [row.companyName, ...(row.directoryBadges ?? []), row.sponsorLicenseStatus ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [employersQuery.data?.data, search]);

  const careersOnly = useMemo(
    () => employerRows.filter((row) => Boolean(row.hasCareersLink)),
    [employerRows]
  );

  const sponsorRows = sponsorQuery.data?.data ?? [];
  const loading = tab === "employers" ? employersQuery.isLoading : sponsorQuery.isLoading;
  const fetching = tab === "employers" ? employersQuery.isFetching : sponsorQuery.isFetching;
  const errored = tab === "employers" ? employersQuery.isError : sponsorQuery.isError;

  const header = (
    <View style={styles.head}>
      <GshDarkFeedHeading
        pageLead
        title="Company directory"
        subtitle="Search employers on Global Sponsor Hub — including careers pages linked — or check public sponsor-register records."
      />
      <View style={styles.tabs}>
        {(
          [
            { id: "employers" as const, label: "GSH employers" },
            { id: "register" as const, label: "Sponsor register" },
          ] as const
        ).map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setTab(item.id)}
            style={[styles.tab, tab === item.id && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === item.id && styles.tabTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        style={styles.search}
        value={q}
        onChangeText={setQ}
        placeholder={tab === "employers" ? "Search employers or badges…" : "Search company name…"}
        placeholderTextColor={colors.placeholder}
      />
      {tab === "employers" && !loading ? (
        <Text style={styles.hint}>
          {careersOnly.length} with careers page linked · {employerRows.length} employers shown
        </Text>
      ) : null}
    </View>
  );

  return (
    <GshScreenShell>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {loading ? (
          <>
            {header}
            <ActivityIndicator style={styles.loading} color={colors.brand} />
          </>
        ) : tab === "employers" ? (
          <FlatList
            data={employerRows}
            keyExtractor={(item: PublicEmployerDirectoryRow) => item.employerUserId}
            contentContainerStyle={styles.list}
            ListHeaderComponent={header}
            refreshControl={
              <RefreshControl refreshing={fetching} onRefresh={() => employersQuery.refetch()} />
            }
            renderItem={({ item }) => (
              <Pressable
                style={[styles.card, cardSurfaceStyle(false)]}
                onPress={() =>
                  openExternalUrlInApp(
                    `${getMarketingSiteUrl()}/companies/${encodeURIComponent(item.employerUserId)}`
                  )
                }
              >
                <Text style={styles.title}>{item.companyName}</Text>
                <Text style={styles.meta}>
                  {item.activeJobs === 1 ? "1 active role on GSH" : `${item.activeJobs} active roles on GSH`}
                </Text>
                <View style={styles.badgeRow}>
                  {(item.directoryBadges ?? []).slice(0, 4).map((badge) => (
                    <Text key={badge} style={styles.badge}>
                      {badge}
                    </Text>
                  ))}
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {errored ? "Company directory could not be loaded." : "No employers match this search."}
              </Text>
            }
          />
        ) : (
          <FlatList
            data={sponsorRows}
            keyExtractor={(item: SponsorCompany) => item.slug}
            contentContainerStyle={styles.list}
            ListHeaderComponent={header}
            refreshControl={
              <RefreshControl refreshing={fetching} onRefresh={() => sponsorQuery.refetch()} />
            }
            renderItem={({ item }) => (
              <Pressable
                style={[styles.card, cardSurfaceStyle(false)]}
                onPress={() => router.push(`/company/${encodeURIComponent(item.slug)}`)}
              >
                <Text style={styles.title}>{item.companyName}</Text>
                <Text style={styles.meta}>
                  {[item.city, item.country, item.visaRoute].filter(Boolean).join(" · ") ||
                    "Sponsor-register record"}
                </Text>
                <Text style={styles.status}>{item.sponsorStatus || "Listed"} · View source details</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {errored ? "Sponsor register could not be loaded." : "No companies match this search."}
              </Text>
            }
          />
        )}
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  head: { ...stackFlatListHeadWrapStyle, gap: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  loading: { marginTop: 40 },
  tabs: { flexDirection: "row", gap: 8 },
  tab: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabActive: { backgroundColor: colors.white, borderColor: colors.white },
  tabText: { color: colors.white, fontFamily: fontFamily.semiBold, fontSize: 12 },
  tabTextActive: { color: colors.navy },
  search: {
    backgroundColor: colors.white,
    color: colors.textPrimary,
    borderRadius: radii.md,
    padding: 13,
    fontFamily: fontFamily.regular,
  },
  hint: { color: "rgba(255,255,255,0.75)", fontFamily: fontFamily.regular, fontSize: 12 },
  card: { padding: 16, borderRadius: radii.lg, marginBottom: 12, backgroundColor: colors.background },
  title: { color: colors.navy, fontFamily: fontFamily.bold, fontSize: 16 },
  meta: { color: colors.textSecondary, fontFamily: fontFamily.regular, fontSize: 13, marginTop: 6 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  badge: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#E6F7F8",
    color: colors.teal,
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  status: { color: colors.teal, fontFamily: fontFamily.semiBold, fontSize: 12, marginTop: 10 },
  empty: { color: colors.white, fontFamily: fontFamily.regular, textAlign: "center", padding: 30 },
});
