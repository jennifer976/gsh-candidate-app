import { withSignIn } from "@/components/SignInGate";
import { useAppCopy } from "@/lib/i18n";
import { applicationStatusLabel } from "@/lib/i18n/catalog";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CompanyLogo } from "@/components/CompanyLogo";
import { GshScreenShell } from "@/components/GshScreenShell";
import { BrandTopBar } from "@/components/BrandTopBar";
import {
  BrandChip,
  BrandStatePanel,
  DecorRing,
  DepthSurface,
  Eyebrow,
  PosterTitle,
  posterParts,
} from "@/components/gsh-brand";
import { tabBarBottomPadding } from "@/lib/android-insets";
import { fetchApplications, withdrawApplication } from "@/lib/api-client";
import { colors, fontFamily, radii } from "@/lib/theme";
import type { Application, ApplicationJobRef } from "@/types/models";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";

type ApplicationFilter = "all" | "active" | "interviewing" | "archived";

function isClosedOrPausedJob(job: ApplicationJobRef | undefined): boolean {
  const status = job?.status?.toLowerCase();
  return status === "closed" || status === "de-activate";
}

function displayStatus(
  app: Application,
  job: ApplicationJobRef | undefined,
): string {
  const status = job?.status?.toLowerCase();
  if (status === "de-activate") return "Role paused";
  if (status === "closed") return "Role closed";
  return app.status || "Pending";
}

function statusTone(status: string): "good" | "bad" | "neutral" {
  const s = status.toLowerCase();
  if (s.includes("closed") || s.includes("paused") || s.includes("reject"))
    return "bad";
  if (s.includes("interview") || s.includes("offer") || s.includes("hired"))
    return "good";
  return "neutral";
}

function canWithdrawApplication(status: string): boolean {
  return !["rejected", "hired", "withdrawn", "closed"].includes(
    status.trim().toLowerCase(),
  );
}

function formatInterviewDate(
  value?: string,
  timezone?: string,
  locale = "en-GB",
): string {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  try {
    return date.toLocaleString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...(timezone ? { timeZone: timezone } : {}),
    });
  } catch {
    return date.toLocaleString(locale);
  }
}

function ApplicationsScreen() {
  const { t, locale, intlLocale } = useAppCopy();
  const ac = useAccountCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ApplicationFilter>("all");

  const query = useQuery({
    queryKey: ["applications"],
    queryFn: fetchApplications,
  });

  const withdraw = useMutation({
    mutationFn: (applicationId: string) => withdrawApplication(applicationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
    onError: () =>
      Alert.alert(
        t("applicationWithdrawError"),
        t("applicationWithdrawErrorHelp"),
      ),
  });

  function confirmWithdraw(appId: string, title: string) {
    Alert.alert(
      t("applicationWithdrawTitle"),
      t("applicationWithdrawHelp", { title }),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("applicationWithdraw"),
          style: "destructive",
          onPress: () => withdraw.mutate(appId),
        },
      ],
    );
  }

  const rows = query.data ?? [];
  const stats = useMemo(() => {
    const interviewing = rows.filter((row) =>
      String(row.status).toLowerCase().includes("interview"),
    ).length;
    const archived = rows.filter((row) =>
      ["rejected", "withdrawn", "hired", "closed"].includes(
        String(row.status).toLowerCase(),
      ),
    ).length;
    return {
      all: rows.length,
      active: Math.max(0, rows.length - archived),
      interviewing,
      archived,
    };
  }, [rows]);
  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      const job = row.jobId as ApplicationJobRef | undefined;
      const status = String(row.status).toLowerCase();
      const archived = ["rejected", "withdrawn", "hired", "closed"].includes(status);
      const filterMatch =
        filter === "all" ||
        (filter === "active" && !archived) ||
        (filter === "interviewing" && status.includes("interview")) ||
        (filter === "archived" && archived);
      if (!filterMatch) return false;
      if (!needle) return true;
      return [job?.title, job?.companyName, job?.location, status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [filter, rows, search]);

  const header = (
    <View style={styles.header}>
      <DecorRing size={220} thickness={30} color="rgba(13,25,78,0.08)" style={{ top: -90, right: -80 }} />
      <BrandTopBar fallback="/(tabs)/saved" />
      <View style={styles.headerBody}>
        <Eyebrow color={colors.navy}>{t("applications")}</Eyebrow>
        <PosterTitle {...posterParts(ac("Your|applications."))} size={34} />
        <Text style={styles.headerSub}>{t("applicationUpdates")}</Text>
      </View>
    </View>
  );

  if (query.isLoading) {
    return (
      <GshScreenShell constrainTabletWidth style={styles.shell}>
        {header}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.cyan} />
          <Text style={styles.muted}>{t("applicationLoading")}</Text>
        </View>
      </GshScreenShell>
    );
  }

  if (query.isError) {
    return (
      <GshScreenShell constrainTabletWidth style={styles.shell}>
        {header}
        <BrandStatePanel
          icon="cloud-offline-outline"
          title={t("applicationLoadError")}
          body={t("retrySupport")}
          primary={{ label: t("retry"), icon: "refresh", onPress: () => void query.refetch() }}
          style={styles.statePanel}
        />
      </GshScreenShell>
    );
  }

  return (
    <GshScreenShell constrainTabletWidth style={styles.shell}>
      <FlatList
        data={filteredRows}
        keyExtractor={(item) => item.id ?? item._id}
        style={styles.listFlex}
        refreshControl={
          <RefreshControl
            refreshing={query.isFetching}
            onRefresh={() => query.refetch()}
            tintColor={colors.cyan}
          />
        }
        contentContainerStyle={[
          styles.listPad,
          { paddingBottom: tabBarBottomPadding(insets.bottom) },
          filteredRows.length === 0 && styles.listPadGrow,
        ]}
        ListHeaderComponent={
          <>
          {header}
          <View style={styles.workspace}>
            <DepthSurface depth={4} radius={18} borderWidth={2} borderColor={colors.navy} innerStyle={styles.searchBox}>
              <Ionicons name="search-outline" size={20} color={colors.textMuted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={ac("Search applications")}
                placeholderTextColor={colors.placeholder}
                style={styles.searchInput}
              />
              {search ? (
                <Pressable
                  onPress={() => setSearch("")}
                  accessibilityRole="button"
                  accessibilityLabel={ac("Clear search")}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </DepthSurface>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              {(
                [
                  ["all", ac("All"), stats.all],
                  ["active", ac("Active"), stats.active],
                  ["interviewing", ac("Interviewing"), stats.interviewing],
                  ["archived", ac("Archived"), stats.archived],
                ] as const
              ).map(([id, label, count]) => (
                <BrandChip
                  key={id}
                  label={`${label} · ${count}`}
                  selected={filter === id}
                  onPress={() => setFilter(id)}
                />
              ))}
            </ScrollView>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                {ac("{count} applications", { count: filteredRows.length })}
              </Text>
              <Pressable onPress={() => router.push("/application-tracker")}>
                <Text style={styles.trackerLink}>{ac("Track external applications")}</Text>
              </Pressable>
            </View>
          </View>
          </>
        }
        renderItem={({ item }) => {
          const job = item.jobId as ApplicationJobRef | undefined;
          const jid = job?._id;
          const rawStatus = displayStatus(item, job);
          const visibleStatus =
            rawStatus === "Role paused"
              ? t("applicationPaused")
              : rawStatus === "Role closed"
                ? t("applicationClosed")
                : applicationStatusLabel(rawStatus, locale);
          const tone = statusTone(rawStatus);
          const lockedByJobLifecycle = isClosedOrPausedJob(job);
          const canWithdraw =
            !lockedByJobLifecycle && canWithdrawApplication(item.status);
          const interviewDate = formatInterviewDate(
            item.interviewSchedule?.scheduledAt,
            item.interviewSchedule?.timezone,
            intlLocale,
          );
          const meta = [job?.location, job?.jobType].filter(Boolean).join(" · ");

          return (
            <DepthSurface
              depth={5}
              radius={20}
              borderWidth={2}
              borderColor={colors.navy}
              style={styles.cardOuter}
              innerStyle={styles.card}
            >
              <Pressable
                onPress={() => jid && router.push(`/job/${jid}`)}
                disabled={!jid}
                style={styles.cardMain}
                android_ripple={{ color: "rgba(13,25,78,0.06)" }}
              >
                <CompanyLogo
                  logoUrl=""
                  companyName={job?.companyName ?? t("screenEmployer")}
                  size={56}
                  radius={14}
                />
                <View style={styles.cardMid}>
                  <Text style={styles.company} numberOfLines={1}>
                    {job?.companyName ?? t("screenEmployer")}
                  </Text>
                  <Text style={styles.title} numberOfLines={2}>
                    {job?.title ?? t("applicationRole")}
                  </Text>
                  {meta ? (
                    <Text style={styles.meta} numberOfLines={1}>
                      {meta}
                    </Text>
                  ) : null}
                  <View
                    style={[
                      styles.statusPill,
                      tone === "good" && styles.statusPillGood,
                      tone === "bad" && styles.statusPillBad,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        tone === "good" && styles.statusPillTextGood,
                        tone === "bad" && styles.statusPillTextBad,
                      ]}
                    >
                      {visibleStatus}
                    </Text>
                  </View>
                  {item.interviewSchedule &&
                  (interviewDate ||
                    item.interviewSchedule.location ||
                    item.interviewSchedule.meetingLink ||
                    item.interviewSchedule.notes) ? (
                    <View style={styles.interviewCard}>
                      <Text style={styles.interviewTitle}>
                        {t("applicationInterview")}
                      </Text>
                      {interviewDate ? (
                        <Text style={styles.interviewDetail}>{interviewDate}</Text>
                      ) : null}
                      {item.interviewSchedule.durationMinutes ? (
                        <Text style={styles.interviewDetail}>
                          {t("applicationMinutes", {
                            count: item.interviewSchedule.durationMinutes,
                          })}
                        </Text>
                      ) : null}
                      {item.interviewSchedule.location ? (
                        <Text style={styles.interviewDetail}>
                          {item.interviewSchedule.location}
                        </Text>
                      ) : null}
                      {item.interviewSchedule.meetingLink ? (
                        <Text style={styles.interviewDetail} numberOfLines={2}>
                          {item.interviewSchedule.meetingLink}
                        </Text>
                      ) : null}
                      {item.interviewSchedule.notes ? (
                        <Text style={styles.interviewNotes}>
                          {item.interviewSchedule.notes}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.navy} />
              </Pressable>
              {lockedByJobLifecycle ? (
                <View style={styles.lifecycleNote}>
                  <Text style={styles.lifecycleNoteText}>
                    {t("applicationClosedHelp")}
                  </Text>
                </View>
              ) : canWithdraw ? (
                <Pressable
                  style={styles.withdraw}
                  accessibilityRole="button"
                  onPress={() =>
                    confirmWithdraw(
                      item.id ?? item._id,
                      job?.title ?? t("applicationThisRole"),
                    )
                  }
                  disabled={withdraw.isPending}
                >
                  <Text style={styles.withdrawText}>{t("applicationWithdraw")}</Text>
                </Pressable>
              ) : null}
            </DepthSurface>
          );
        }}
        ListEmptyComponent={
          <BrandStatePanel
            icon={rows.length ? "search-outline" : "document-text-outline"}
            title={rows.length ? ac("No applications match these filters") : t("applicationEmpty")}
            body={
              rows.length
                ? ac("Try a different word, or clear your filters.")
                : ac("When you apply for a job, it shows up here with every update.")
            }
            primary={
              rows.length
                ? {
                    label: ac("Clear filters"),
                    icon: "close",
                    onPress: () => {
                      setSearch("");
                      setFilter("all");
                    },
                  }
                : { label: t("homeBrowse"), onPress: () => router.push("/(tabs)/jobs") }
            }
            style={styles.statePanel}
          />
        }
      />
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: colors.white },
  listFlex: { flex: 1 },
  listPad: { gap: 14 },
  listPadGrow: { flexGrow: 1 },
  header: {
    backgroundColor: colors.cyan,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 24,
    overflow: "hidden",
  },
  headerBody: { paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  headerSub: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
    color: "rgba(13,25,78,0.78)",
  },
  workspace: { gap: 12, marginTop: 18, marginBottom: 2, paddingHorizontal: 16 },
  searchBox: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 46,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.navy,
  },
  filters: { gap: 8, paddingRight: 4, paddingBottom: 4 },
  summaryRow: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  summaryText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.textMuted,
  },
  trackerLink: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.navy,
    textDecorationLine: "underline",
  },
  cardOuter: { marginHorizontal: 16 },
  card: { overflow: "hidden" },
  cardMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
  },
  cardMid: { flex: 1, minWidth: 0, gap: 4 },
  company: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 17,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  meta: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  statusPill: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.navy,
    backgroundColor: colors.pale,
  },
  statusPillGood: { backgroundColor: colors.cyan },
  statusPillBad: { backgroundColor: colors.white, borderColor: colors.borderStrong },
  statusPillText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  statusPillTextGood: { color: colors.navy },
  statusPillTextBad: { color: colors.textMuted },
  interviewCard: {
    marginTop: 10,
    padding: 12,
    gap: 4,
    borderRadius: 14,
    backgroundColor: colors.navy,
  },
  interviewTitle: {
    fontSize: 11,
    fontFamily: fontFamily.extraBold,
    color: colors.cyan,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  interviewDetail: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.white,
    lineHeight: 18,
  },
  interviewNotes: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 18,
  },
  lifecycleNote: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  lifecycleNoteText: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 18,
  },
  withdraw: {
    marginHorizontal: 16,
    marginBottom: 14,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: "rgba(185,28,28,0.35)",
    backgroundColor: colors.white,
  },
  withdrawText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.error,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 15,
    fontFamily: fontFamily.medium,
  },
  statePanel: { marginHorizontal: 16, marginTop: 16 },
});

export default withSignIn(ApplicationsScreen, {
  icon: "document-text-outline",
  title: "Track your applications",
  body: "Sign in to see every job you have applied for and where it stands.",
});
