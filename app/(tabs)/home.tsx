import { applicationStatusLabel } from "@/lib/i18n/catalog";
import { useAppCopy } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DashboardHubJobPreview } from "@/components/DashboardHubJobPreview";
import { GshScreenShell } from "@/components/GshScreenShell";
import { GshTabHeroHeader } from "@/components/GshTabHeroHeader";
import { GshEmptyState } from "@/components/GshEmptyState";
import { GshLinkRow } from "@/components/gsh-ui-kit";
import {
  fetchCandidateDashboard,
  fetchConversations,
  fetchJobMatches,
  fetchOwnProfile,
} from "@/lib/api-client";
import { presentApiError } from "@/lib/api-error";
import { getCandidateCompletionBreakdown } from "@/lib/profile-completion";
import { hapticLight } from "@/lib/haptics";
import { FEED_ITEM_GAP, FEED_SECTION_GAP } from "@/lib/screen-layout";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";

function Metric({
  label,
  value,
  hint,
  onPress,
}: {
  label: string;
  value: string | number;
  hint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.metric}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHint}>{hint}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { t, locale } = useAppCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const q = useQuery({
    queryKey: ["analytics", "candidate-dashboard"],
    queryFn: fetchCandidateDashboard,
  });
  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchOwnProfile,
    staleTime: 45_000,
  });
  const conversationsQuery = useQuery({
    queryKey: ["message-conversations"],
    queryFn: fetchConversations,
    staleTime: 60_000,
  });
  const matchesQuery = useQuery({
    queryKey: ["candidate", "job-matches", "home"],
    queryFn: () => fetchJobMatches({ unread: true, limit: 1 }),
    staleTime: 30_000,
  });

  const firstName =
    profileQuery.data &&
    typeof (profileQuery.data as { firstName?: unknown }).firstName === "string"
      ? String((profileQuery.data as { firstName: string }).firstName)
      : "";
  const discoveryOn =
    (profileQuery.data as { employerDiscoveryConsent?: { enabled?: unknown } } | undefined)
      ?.employerDiscoveryConsent?.enabled === true;

  const onRefresh = useCallback(() => {
    void q.refetch();
    void profileQuery.refetch();
    void matchesQuery.refetch();
  }, [q, profileQuery, matchesQuery]);

  if (q.isLoading && !q.data) {
    return (
      <GshScreenShell constrainTabletWidth>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.brand}
            accessibilityLabel={t("homeLoadingLabel")}
          />
          <Text style={styles.loadingHint}>{t("homeLoading")}</Text>
        </View>
      </GshScreenShell>
    );
  }

  if (q.isError || !q.data) {
    const errCopy = presentApiError(q.error, locale);
    return (
      <GshScreenShell constrainTabletWidth>
        <ScrollView
          contentContainerStyle={styles.centerPad}
          refreshControl={
            <RefreshControl
              refreshing={q.isFetching}
              onRefresh={onRefresh}
              tintColor={colors.navy}
            />
          }
        >
          <View
            accessible
            accessibilityRole="alert"
            accessibilityLabel={`${errCopy.title}. ${errCopy.subtitle}`}
            style={styles.errorAnnounce}
          >
            <Ionicons
              name="briefcase-outline"
              size={48}
              color={colors.teal}
              importantForAccessibility="no"
            />
            <Text style={styles.errorTitle}>{errCopy.title}</Text>
            <Text style={styles.errorSub}>{errCopy.subtitle}</Text>
          </View>
          <Pressable
            style={styles.retryBtn}
            onPress={() => void q.refetch()}
            accessibilityRole="button"
            accessibilityLabel={t("retry")}
            accessibilityHint={t("homeReloadHint")}
          >
            <Text style={styles.retryText}>{t("retry")}</Text>
          </Pressable>
        </ScrollView>
      </GshScreenShell>
    );
  }

  const d = q.data;
  const missing = profileQuery.data
    ? getCandidateCompletionBreakdown(profileQuery.data, locale).missing
    : [];
  const recentSlice = (d.recentApplications ?? []).slice(0, 5);
  const savedJobRows = (d.savedJobs ?? []).filter(
    (job): job is NonNullable<typeof job> =>
      Boolean(job && typeof job === "object" && job._id),
  );
  const savedCount = savedJobRows.length;
  const greeting = firstName
    ? t("homeGreetingName", { name: firstName })
    : t("homeGreeting");
  const chatCount = conversationsQuery.data?.length ?? 0;
  const latestJobCount = (d.latestJobs ?? []).length;
  const unreadMatches = matchesQuery.data?.unreadCount ?? 0;
  const appliedCount = d.stats.totalApplied ?? 0;
  const isNewUser =
    appliedCount === 0 && savedCount === 0 && latestJobCount === 0;

  const next =
    unreadMatches > 0
      ? {
          title: t("homeMatches"),
          href: "/alerts" as const,
        }
      : missing.length > 0
        ? {
            title: t("homeProfileStep"),
            href: "/(tabs)/profile" as const,
          }
        : !discoveryOn
          ? {
              title: t("homeMatchingNudge"),
              href: "/mobility-profile" as const,
            }
          : {
              title: t("homeBrowse"),
              href: "/(tabs)/jobs" as const,
            };

  return (
    <GshScreenShell constrainTabletWidth>
      <ScrollView
        contentContainerStyle={styles.scrollPad}
        refreshControl={
          <RefreshControl
            refreshing={q.isFetching}
            onRefresh={onRefresh}
            tintColor={colors.navy}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <GshTabHeroHeader
          paddingTop={Math.max(insets.top, 20) + 8}
          tagline={t("homeTagline")}
        >
          <Text style={styles.heroTitle}>{greeting}</Text>
          <Text style={styles.heroLead}>{t("homeLead")}</Text>
        </GshTabHeroHeader>

        <View style={styles.bodyPad}>
          <Pressable
            style={styles.nextCard}
            onPress={() => {
              void hapticLight();
              router.push(next.href);
            }}
            accessibilityRole="button"
          >
            <View style={styles.nextRule} />
            <Text style={styles.nextEyebrow}>{t("homeNextStep")}</Text>
            <Text style={styles.nextTitle}>{next.title}</Text>
            <Text style={styles.nextBody}>{t("homePickUp")}</Text>
            <View style={styles.nextCta}>
              <Text style={styles.nextCtaText}>{t("homeContinue")}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.navy} />
            </View>
          </Pressable>

          <View style={styles.metrics}>
            <Metric
              label={t("homeMatches")}
              value={matchesQuery.isError ? "—" : unreadMatches}
              hint={t("homeSeeAll")}
              onPress={() => router.push("/alerts")}
            />
            <Metric
              label={t("saved")}
              value={savedCount}
              hint={t("homeSeeAll")}
              onPress={() => router.push("/saved")}
            />
            <Metric
              label={t("applications")}
              value={appliedCount}
              hint={t("homeOpen")}
              onPress={() => router.push("/(tabs)/applications")}
            />
          </View>

          {isNewUser ? (
            <GshEmptyState
              icon="compass-outline"
              title={t("homeEmpty")}
              actionLabel={t("homeBrowse")}
              onAction={() => router.push("/(tabs)/jobs")}
            />
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>{t("homeFind")}</Text>
            <Text style={styles.sectionTitle}>{t("homeNew")}</Text>
            {latestJobCount > 0 ? (
              <View style={styles.feedCardStack}>
                {(d.latestJobs ?? []).slice(0, 3).map((job) => (
                  <DashboardHubJobPreview
                    key={job._id}
                    job={job}
                    onPress={() => router.push(`/job/${job._id}`)}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.sectionHint}>{t("homeFindLead")}</Text>
            )}
            <Pressable
              style={styles.textLink}
              onPress={() => router.push("/(tabs)/jobs")}
              accessibilityRole="button"
            >
              <Text style={styles.textLinkLabel}>{t("homeBrowseAll")}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.navy} />
            </Pressable>
          </View>

          {recentSlice.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionEyebrow}>{t("applications")}</Text>
              <Text style={styles.sectionTitle}>{t("homeRecent")}</Text>
              <View style={styles.feedCardStack}>
                {recentSlice.map((a, i) => (
                  <View
                    key={`${a.jobTitle}-${i}`}
                    style={[styles.appRow, feedCardStyle()]}
                  >
                    <View style={styles.appText}>
                      <Text style={styles.listTitle} numberOfLines={2}>
                        {a.jobTitle}
                      </Text>
                      <Text style={styles.listSub} numberOfLines={2}>
                        {a.companyName} ·{" "}
                        <Text style={styles.statusEm}>
                          {applicationStatusLabel(a.status, locale)}
                        </Text>
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <Pressable
                style={styles.textLink}
                onPress={() => router.push("/(tabs)/applications")}
                accessibilityRole="button"
              >
                <Text style={styles.textLinkLabel}>{t("homeOpen")}</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.navy} />
              </Pressable>
            </View>
          ) : null}

          {chatCount > 0 ? (
            <GshLinkRow
              title={t("messages")}
              subtitle={t("homePickUp")}
              icon="chatbubbles-outline"
              accent="teal"
              onPress={() => router.push("/(tabs)/messages")}
            />
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>{t("homeHelp")}</Text>
            <Text style={styles.sectionTitle}>{t("screenRelocationhelp")}</Text>
            <Text style={styles.sectionHint}>{t("homeMoveLead")}</Text>
          </View>
          <GshLinkRow
            title={t("screenRelocationhelp")}
            subtitle={t("homeMoveLead")}
            icon="airplane-outline"
            accent="teal"
            onPress={() => router.push("/relocation-help")}
          />
          <GshLinkRow
            title={t("resourcesSpecialists")}
            subtitle={t("resourcesSpecialistsHelp")}
            icon="people-outline"
            accent="teal"
            onPress={() => router.push("/partners")}
          />
          <GshLinkRow
            title={t("resourcesGuides")}
            subtitle={t("resourcesGuidesHelp")}
            icon="map-outline"
            accent="teal"
            onPress={() => router.push("/guides")}
          />
          <GshLinkRow
            title={t("homeTools")}
            subtitle={t("homeToolsHelp")}
            icon="library-outline"
            accent="teal"
            onPress={() => router.push("/tools-resources")}
          />
        </View>
      </ScrollView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollPad: { paddingBottom: 48 },
  bodyPad: {
    paddingHorizontal: 16,
    paddingTop: FEED_SECTION_GAP,
    paddingBottom: 4,
    gap: 14,
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 36,
    fontFamily: fontFamily.headingStrong,
    color: colors.navy,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  heroLead: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    maxWidth: 420,
  },
  nextCard: {
    backgroundColor: colors.navy,
    borderRadius: radii.lg,
    paddingVertical: 22,
    paddingHorizontal: 22,
    overflow: "hidden",
  },
  nextRule: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.tealOnNavy,
  },
  nextEyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.tealOnNavy,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  nextTitle: {
    marginTop: 10,
    fontSize: 22,
    lineHeight: 26,
    fontFamily: fontFamily.heading,
    color: colors.white,
    letterSpacing: -0.4,
  },
  nextBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.65)",
  },
  nextCta: {
    marginTop: 18,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.teal,
    borderRadius: radii.pill,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  nextCtaText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  metrics: {
    flexDirection: "row",
    gap: 8,
  },
  metric: {
    flex: 1,
    minHeight: 88,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  metricValue: {
    marginTop: 6,
    fontSize: 22,
    fontFamily: fontFamily.headingStrong,
    color: colors.navy,
    letterSpacing: -0.4,
  },
  metricHint: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  section: { paddingTop: 8, gap: 6 },
  sectionEyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.teal,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.4,
  },
  sectionHint: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  feedCardStack: { gap: FEED_ITEM_GAP, marginTop: 8 },
  appRow: { paddingVertical: 14, paddingHorizontal: 14 },
  appText: { minWidth: 0 },
  listTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.2,
  },
  listSub: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
  statusEm: { fontFamily: fontFamily.semiBold, color: colors.textSecondary },
  textLink: {
    marginTop: 6,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  textLinkLabel: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    textDecorationLine: "underline",
    textDecorationColor: colors.teal,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  centerPad: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  errorAnnounce: { alignItems: "center", maxWidth: 340, gap: 8 },
  errorTitle: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  errorSub: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  loadingHint: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
  retryBtn: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.brand,
  },
  retryText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.white,
  },
});
