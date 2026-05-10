import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchPublicJobs } from "@/lib/api-client";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { Job } from "@/types/models";

function formatSalary(job: Job): string {
  const cur = job.salaryCurrency || "GBP";
  const sym = cur === "GBP" ? "£" : cur === "EUR" ? "€" : cur === "USD" ? "$" : `${cur} `;
  if (job.minSalary != null && job.maxSalary != null) {
    return `${sym}${job.minSalary.toLocaleString()}–${job.maxSalary.toLocaleString()}`;
  }
  if (job.minSalary != null) return `From ${sym}${job.minSalary.toLocaleString()}`;
  return "";
}

export default function JobsScreen() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  const query = useQuery({
    queryKey: ["public-jobs", debouncedQ],
    queryFn: () =>
      fetchPublicJobs({
        q: debouncedQ || undefined,
        page: 1,
        perPage: 25,
      }),
  });

  const onRefresh = useCallback(() => {
    void query.refetch();
  }, [query]);

  const jobs = query.data?.data ?? [];

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <Pressable
          style={[styles.alertsBanner, cardSurfaceStyle(true)]}
          onPress={() => router.push("/alerts")}
          accessibilityRole="button"
          accessibilityLabel="Job alerts and saved searches"
        >
          <View style={styles.alertsRow}>
            <View style={styles.alertsIconWrap}>
              <Ionicons name="notifications" size={22} color={colors.brand} />
            </View>
            <View style={styles.alertsTextCol}>
              <Text style={styles.alertsBannerTitle}>Job alerts & saved searches</Text>
              <Text style={styles.alertsBannerSub}>Matches, email prefs, keyword alerts</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textMuted} accessibilityElementsHidden />
          </View>
        </Pressable>

        <View style={styles.searchOuter}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={20} color={colors.placeholder} style={styles.searchIcon} />
            <TextInput
              style={styles.search}
              placeholder="Search roles, skills, company…"
              placeholderTextColor={colors.placeholder}
              value={q}
              onChangeText={setQ}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search jobs"
            />
          </View>
        </View>

        {query.isLoading && !query.data ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.loadingHint}>Finding roles…</Text>
          </View>
        ) : query.isError ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
            <Text style={styles.errTitle}>Could not load jobs</Text>
            <Text style={styles.errSub}>Pull down to try again.</Text>
          </View>
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item._id}
            refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={onRefresh} />}
            contentContainerStyle={styles.listPad}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.card, cardSurfaceStyle(true)]}
                onPress={() => router.push(`/job/${item._id}`)}
                accessibilityRole="button"
              >
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.cardCompany} numberOfLines={1}>
                  {item.companyName || "Employer"}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {[item.locationCity, item.locationCountry].filter(Boolean).join(", ") || item.location || ""}
                  {item.jobType ? ` · ${item.jobType}` : ""}
                </Text>
                {formatSalary(item) ? <Text style={styles.cardSalary}>{formatSalary(item)}</Text> : null}
                <View style={styles.cardFooter}>
                  <Text style={styles.cardCta}>View role</Text>
                  <Ionicons name="arrow-forward-circle" size={22} color={colors.teal} />
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Ionicons name="search-outline" size={44} color={colors.borderStrong} />
                <Text style={styles.empty}>No roles match your search yet. Try another keyword.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  alertsBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  alertsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  alertsIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.purpleMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  alertsTextCol: { flex: 1 },
  alertsBannerTitle: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.purpleTextDark },
  alertsBannerSub: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.regular, color: colors.purpleText, lineHeight: 18 },
  searchOuter: { paddingHorizontal: 16, paddingVertical: 12 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.92)",
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 4 },
  search: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
  },
  listPad: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: {
    padding: 16,
  },
  cardTitle: { fontSize: 17, fontFamily: fontFamily.bold, color: colors.textPrimary, letterSpacing: -0.2 },
  cardCompany: { marginTop: 8, fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.textMarketing },
  cardMeta: { marginTop: 4, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted },
  cardSalary: { marginTop: 10, fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.teal },
  cardFooter: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
    paddingTop: 12,
  },
  cardCta: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.brand },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 10 },
  loadingHint: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.textMuted },
  errTitle: { fontFamily: fontFamily.semiBold, fontSize: 17, color: colors.textPrimary },
  errSub: { fontFamily: fontFamily.regular, fontSize: 14, color: colors.textMuted, textAlign: "center" },
  emptyWrap: { alignItems: "center", paddingHorizontal: 24, marginTop: 32, gap: 12 },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    lineHeight: 22,
  },
});
