import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
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
import {
  fetchEmployerFollows,
  fetchPublicEmployersDirectory,
  fetchPublicSponsorCompanies,
} from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { stackFlatListHeadWrapStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type {
  PublicEmployerDirectoryRow,
  SponsorCompany,
} from "@/types/models";

type DirectoryTab = "employers" | "register";

export default function CompaniesScreen() {
  const ac = useAccountCopy();

  const router = useRouter();
  const token = useAuthStore((state) => state.token);
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
  const followsQuery = useQuery({
    queryKey: ["candidate", "employer-follows"],
    queryFn: fetchEmployerFollows,
    enabled: Boolean(token),
  });
  const sponsorQuery = useQuery({
    queryKey: ["sponsor-companies", search],
    queryFn: () =>
      fetchPublicSponsorCompanies({
        q: search || undefined,
        page: 1,
        perPage: 50,
      }),
    enabled: tab === "register",
  });

  const employerRows = useMemo(() => {
    const rows = employersQuery.data?.data ?? [];
    if (!search) return rows;
    return rows.filter((row) =>
      [
        row.companyName,
        ...(row.directoryBadges ?? []),
        row.sponsorLicenseStatus ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [employersQuery.data?.data, search]);

  const careersOnly = useMemo(
    () => employerRows.filter((row) => Boolean(row.hasCareersLink)),
    [employerRows],
  );

  const sponsorRows = sponsorQuery.data?.data ?? [];
  const loading =
    tab === "employers" ? employersQuery.isLoading : sponsorQuery.isLoading;
  const fetching =
    tab === "employers" ? employersQuery.isFetching : sponsorQuery.isFetching;
  const errored =
    tab === "employers" ? employersQuery.isError : sponsorQuery.isError;

  const header = (
    <View style={styles.head}>
      <GshDarkFeedHeading
        pageLead
        title={ac("Company directory")}
        subtitle={ac(
          "Find employers, connected careers pages and public sponsor-register records.",
        )}
      />
      <View style={styles.tabs}>
        {(
          [
            {
              id: "employers" as const,
              label: ac("Global Sponsor Hub employers"),
            },
            { id: "register" as const, label: ac("Sponsor register") },
          ] as const
        ).map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setTab(item.id)}
            style={[styles.tab, tab === item.id && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, tab === item.id && styles.tabTextActive]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        style={styles.search}
        value={q}
        onChangeText={setQ}
        placeholder={
          tab === "employers"
            ? ac("Search employers or badges…")
            : ac("Search company name…")
        }
        placeholderTextColor={colors.placeholder}
      />
      {tab === "employers" && !loading ? (
        <View style={styles.directorySummary}>
          <Text style={styles.hint}>
            {ac("Employers: {count} · Careers pages: {careers}", {
              count: employerRows.length,
              careers: careersOnly.length,
            })}
          </Text>
          <Pressable
            style={styles.followingLink}
            onPress={() =>
              router.push(
                token
                  ? "/employer-follows"
                  : {
                      pathname: "/login",
                      params: { returnTo: "/employer-follows" },
                    },
              )
            }
          >
            <Text style={styles.followingLinkText}>
              {ac("Following")}{" "}
              {token ? `(${followsQuery.data?.length ?? 0})` : ""}
            </Text>
          </Pressable>
        </View>
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
            keyExtractor={(item: PublicEmployerDirectoryRow) =>
              item.employerUserId
            }
            contentContainerStyle={styles.list}
            ListHeaderComponent={header}
            refreshControl={
              <RefreshControl
                refreshing={fetching}
                onRefresh={() => employersQuery.refetch()}
              />
            }
            renderItem={({ item }) => (
              <Pressable
                style={[styles.card, cardSurfaceStyle(false)]}
                onPress={() =>
                  router.push(
                    `/company/employer/${encodeURIComponent(item.employerUserId)}`,
                  )
                }
              >
                <Text style={styles.title}>{item.companyName}</Text>
                <Text style={styles.meta}>
                  {ac("Active jobs: {count}", { count: item.activeJobs })}
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
                {errored
                  ? ac("Company directory could not be loaded.")
                  : ac("No employers match this search.")}
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
              <RefreshControl
                refreshing={fetching}
                onRefresh={() => sponsorQuery.refetch()}
              />
            }
            renderItem={({ item }) => (
              <Pressable
                style={[styles.card, cardSurfaceStyle(false)]}
                onPress={() =>
                  router.push(`/company/${encodeURIComponent(item.slug)}`)
                }
              >
                <Text style={styles.title}>{item.companyName}</Text>
                <Text style={styles.meta}>
                  {[item.city, item.country, item.visaRoute]
                    .filter(Boolean)
                    .join(" · ") || ac("Sponsor-register record")}
                </Text>
                <Text style={styles.status}>
                  {item.sponsorStatus || ac("Listed")}
                  {ac("View source details")}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {errored
                  ? ac("Sponsor register could not be loaded.")
                  : ac("No companies match this search.")}
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
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tab: {
    flexShrink: 1,
    minHeight: 44,
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  tabText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
  },
  tabTextActive: { color: colors.white },
  search: {
    backgroundColor: colors.white,
    color: colors.textPrimary,
    borderRadius: radii.md,
    padding: 13,
    fontSize: 16,
    fontFamily: fontFamily.regular,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: 12,
  },
  directorySummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  followingLink: {
    borderBottomWidth: 1,
    borderBottomColor: colors.teal,
    paddingVertical: 2,
  },
  followingLinkText: {
    color: colors.navy,
    fontFamily: fontFamily.bold,
    fontSize: 12,
  },
  card: {
    padding: 16,
    borderRadius: radii.lg,
    marginBottom: 12,
    backgroundColor: colors.background,
  },
  title: { color: colors.navy, fontFamily: fontFamily.bold, fontSize: 16 },
  meta: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    marginTop: 6,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  badge: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#E6F7F8",
    color: colors.navy,
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  status: {
    color: colors.navy,
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    marginTop: 10,
  },
  empty: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    textAlign: "center",
    padding: 30,
  },
});
