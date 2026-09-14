import { useAppCopy } from "@/lib/i18n";
import { applicationStatusLabel } from "@/lib/i18n/catalog";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CompanyLogo } from "@/components/CompanyLogo";
import { GshScreenShell } from "@/components/GshScreenShell";
import { GshTabStickyHeader } from "@/components/GshTabStickyHeader";
import { brandMark } from "@/lib/brand-assets";
import { fetchApplications, withdrawApplication } from "@/lib/api-client";
import { colors, fontFamily, radii } from "@/lib/theme";
import type { Application, ApplicationJobRef } from "@/types/models";

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

export default function ApplicationsScreen() {
  const { t, locale } = useAppCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

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

  if (query.isLoading) {
    return (
      <GshScreenShell constrainTabletWidth style={styles.shell}>
        <GshTabStickyHeader
          title={t("applications")}
          subtitle={t("applicationUpdates")}
          paddingTop={Math.max(insets.top, 12) + 4}
        />
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
        <GshTabStickyHeader
          title={t("applications")}
          subtitle={t("applicationUpdates")}
          paddingTop={Math.max(insets.top, 12) + 4}
        />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
          <Text style={styles.err}>{t("applicationLoadError")}</Text>
          <Pressable
            onPress={() => void query.refetch()}
            accessibilityRole="button"
            style={styles.retryBtn}
          >
            <Text style={styles.retryBtnText}>{t("retry")}</Text>
          </Pressable>
        </View>
      </GshScreenShell>
    );
  }

  return (
    <GshScreenShell constrainTabletWidth style={styles.shell}>
      <GshTabStickyHeader
        title={t("applications")}
        subtitle={t("applicationUpdates")}
        paddingTop={Math.max(insets.top, 12) + 4}
      />
      <FlatList
        data={rows}
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
          rows.length === 0 && styles.listPadGrow,
        ]}
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
            locale,
          );
          const meta = [job?.location, job?.jobType].filter(Boolean).join(" · ");

          return (
            <View style={styles.card}>
              <View style={styles.accent} />
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
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
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
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyMarkWell}>
              <Image source={brandMark} style={styles.emptyMark} resizeMode="contain" />
            </View>
            <Text style={styles.empty}>{t("applicationEmpty")}</Text>
            <Pressable
              style={styles.emptyCta}
              onPress={() => router.push("/(tabs)/jobs")}
              accessibilityRole="button"
            >
              <Text style={styles.emptyCtaText}>{t("homeBrowse")}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.navy} />
            </Pressable>
          </View>
        }
      />
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: colors.pale },
  listFlex: { flex: 1 },
  listPad: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40, gap: 12 },
  listPadGrow: { flexGrow: 1 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
    position: "relative",
  },
  accent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.cyan,
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingLeft: 18,
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
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
  },
  statusPillGood: { backgroundColor: "rgba(21,128,61,0.12)" },
  statusPillBad: { backgroundColor: "rgba(185,28,28,0.1)" },
  statusPillText: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
  },
  statusPillTextGood: { color: "#15803d" },
  statusPillTextBad: { color: colors.error },
  interviewCard: {
    marginTop: 10,
    padding: 12,
    gap: 4,
    borderRadius: radii.md,
    backgroundColor: colors.pale,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  interviewTitle: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  interviewDetail: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  interviewNotes: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 18,
  },
  lifecycleNote: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingLeft: 18,
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
    marginLeft: 18,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(185,28,28,0.28)",
    backgroundColor: "rgba(185,28,28,0.04)",
  },
  withdrawText: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
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
  err: {
    color: colors.error,
    textAlign: "center",
    fontFamily: fontFamily.medium,
  },
  retryBtn: {
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    backgroundColor: colors.navy,
  },
  retryBtnText: {
    color: colors.white,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
  },
  emptyWrap: {
    alignItems: "center",
    marginTop: 36,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyMarkWell: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyMark: { width: 40, height: 40 },
  empty: {
    fontFamily: fontFamily.heading,
    fontSize: 18,
    color: colors.navy,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  emptyCta: {
    marginTop: 4,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
  },
  emptyCtaText: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
});
