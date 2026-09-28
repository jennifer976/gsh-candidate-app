import { useAppCopy } from "@/lib/i18n";
import { appCopy, type AppLanguage } from "@/lib/i18n/catalog";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { jobAgeLabel, jobChipLabel, jobLocationLabel, jobSalaryLabel } from "@/lib/job-presentation";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInUp, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CompanyLogo } from "@/components/CompanyLogo";
import { CandidateCompatibilityCard } from "@/components/CandidateCompatibilityCard";
import {
  BrandStatePanel,
  DecorRing,
  DepthButton,
  DepthPressable,
  DepthSurface,
} from "@/components/gsh-brand";
import { SkeletonBox } from "@/components/SkeletonLoader";
import { applyToJob, fetchJobById, fetchOwnProfile, saveJob } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { computeCandidateReadiness } from "@/lib/candidate-readiness";
import { persistCandidateReturnIntent } from "@/lib/candidate-return-intent";
import { hapticLight, hapticSuccess, hapticWarning } from "@/lib/haptics";
import { clearIdempotencyKey, getOrCreateIdempotencyKey } from "@/lib/idempotency";
import {
  getJobEmployerLabel,
  getJobLogoUrl,
  hubListingChips,
  formatVisaRouteChip,
  splitMobilityAndPerks,
  stripHtmlToPlainText,
  visaRouteChips,
} from "@/lib/job-display";
import { colors, fontFamily, radii } from "@/lib/theme";
import type { Job, ScreeningAnswer } from "@/types/models";

type IonName = keyof typeof Ionicons.glyphMap;

function errMsg(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "Something went wrong.";
}

function applicationUnavailableReason(job: Job, locale: AppLanguage): string | null {
  const status = String(job.status || "").toLowerCase();
  if (status && status !== "active") {
    if (status === "de-activate" || status === "paused") return appCopy(locale, "detailPaused");
    return appCopy(locale, "detailClosed");
  }
  if (job.expiresAt) {
    const expiresAt = new Date(job.expiresAt);
    if (!Number.isFinite(expiresAt.getTime())) return appCopy(locale, "detailUnavailable");
    if (expiresAt.getTime() <= Date.now()) {
      return appCopy(locale, "detailExpired");
    }
  }
  return null;
}

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.sectionHead}>
      <View style={styles.sectionRule} />
      <Text style={styles.sectionTitle} accessibilityRole="header">{title}</Text>
    </View>
  );
}

function HeroFact({ icon, label }: { icon: IonName; label: string }) {
  if (!label) return null;
  return (
    <View style={styles.heroFact}>
      <Ionicons name={icon} size={14} color={colors.cyan} />
      <Text style={styles.heroFactText} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function RoundButton({
  icon,
  onPress,
  label,
  active,
  disabled,
}: {
  icon: IonName;
  onPress: () => void;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={[styles.roundButton, active && styles.roundButtonOn]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: Boolean(active), disabled: Boolean(disabled) }}
    >
      <Ionicons name={icon} size={20} color={active ? colors.navy : colors.white} />
    </Pressable>
  );
}

function JobDetailSkeleton() {
  return (
    <View style={styles.skeletonPad}>
      <SkeletonBox width="40%" height={14} radius={5} />
      <SkeletonBox width="100%" height={12} radius={5} style={{ marginTop: 14 }} />
      <SkeletonBox width="95%" height={12} radius={5} style={{ marginTop: 8 }} />
      <SkeletonBox width="85%" height={12} radius={5} style={{ marginTop: 8 }} />
      <SkeletonBox width="90%" height={12} radius={5} style={{ marginTop: 8 }} />
      <SkeletonBox width="35%" height={14} radius={5} style={{ marginTop: 28 }} />
      <SkeletonBox width="100%" height={48} radius={14} style={{ marginTop: 14 }} />
      <SkeletonBox width="100%" height={48} radius={14} style={{ marginTop: 10 }} />
    </View>
  );
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const insets = useSafeAreaInsets();
  const { t, locale, intlLocale } = useAppCopy();
  const ac = useAccountCopy();
  const reducedMotion = useReducedMotion();
  const jobId = String(id || "");
  const [coverLetter, setCoverLetter] = useState("");
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const accountEmail = useAuthStore((state) => state.user?.email);
  const token = useAuthStore((state) => state.token);

  const jobQuery = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJobById(jobId),
    enabled: !!jobId.trim(),
  });

  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchOwnProfile,
    enabled: Boolean(token),
  });

  const resumeUrl =
    profileQuery.data && typeof (profileQuery.data as { resume?: unknown }).resume === "string"
      ? String((profileQuery.data as { resume: string }).resume).trim()
      : "";

  const saveMut = useMutation({
    mutationFn: () => saveJob(jobId),
    onSuccess: () => {
      setSaved(true);
      void hapticSuccess();
      void qc.invalidateQueries({ queryKey: ["saved-jobs"] });
      void qc.invalidateQueries({ queryKey: ["analytics", "candidate-dashboard"] });
    },
    onError: (e: unknown) => {
      void hapticWarning();
      const msg = errMsg(e);
      if (msg.includes("already saved")) {
        setSaved(true);
      } else {
        Alert.alert(t("jobsSaveError"), t("jobsActionError"));
      }
    },
  });

  const applyMut = useMutation({
    mutationFn: async () => {
      const idempotencyKey = await getOrCreateIdempotencyKey(`application:${jobId}`);
      const answers: ScreeningAnswer[] = (jobQuery.data?.screeningQuestions ?? []).map((question) => ({
        questionId: question.id,
        answer: screeningAnswers[question.id]?.trim() ?? "",
      }));
      return applyToJob(jobId, coverLetter, resumeUrl, answers, idempotencyKey);
    },
    onSuccess: () => {
      void clearIdempotencyKey(`application:${jobId}`);
      void hapticSuccess();
      void qc.invalidateQueries({ queryKey: ["applications"] });
      void qc.invalidateQueries({ queryKey: ["analytics", "candidate-dashboard"] });
      Alert.alert(
        t("detailSent"),
        t("detailSentHelp"),
        [{ text: t("ok"), onPress: () => router.back() }]
      );
    },
    onError: () => {
      void hapticWarning();
      Alert.alert(t("detailApplyError"), t("detailApplyErrorHelp"));
    },
  });

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/jobs");
  }

  function onApplyPress() {
    if (!token) {
      const returnTo = `/job/${encodeURIComponent(jobId)}`;
      void persistCandidateReturnIntent(returnTo, { kind: "apply_job", jobId }).then(() => {
        router.push({
          pathname: "/login",
          params: { returnTo, pendingAction: "apply_job", pendingTargetId: jobId },
        });
      });
      return;
    }
    if (profileQuery.isLoading) {
      Alert.alert(t("detailWait"), t("detailProfileLoading"));
      return;
    }
    const profile = profileQuery.data as Record<string, unknown> | undefined;
    const applicationReadiness = computeCandidateReadiness(profile, accountEmail).application;
    if (applicationReadiness.status !== "ready") {
      Alert.alert(
        t("detailProfile"),
        applicationReadiness.missing.map(value => {
          const labels = { "Complete your candidate profile": "detailProfile", "Add your first and last name": "detailName", "Add your location or target countries": "detailLocation", "Add a job title, experience, or skills": "detailExperience", "Upload your CV": "detailCv" } as const;
          return t(labels[value as keyof typeof labels] ?? "detailProfile");
        }).join("\n"),
        [
          { text: t("cancel"), style: "cancel" },
          { text: t("profile"), onPress: () => router.push("/(tabs)/profile") },
        ]
      );
      return;
    }
    const unanswered = (jobQuery.data?.screeningQuestions ?? []).filter(
      (question) => question.required !== false && !screeningAnswers[question.id]?.trim(),
    );
    if (unanswered.length) {
      Alert.alert(t("detailQuestions"), t("detailQuestionsHelp"));
      return;
    }
    const unavailable = jobQuery.data ? applicationUnavailableReason(jobQuery.data, locale) : t("detailUnavailable");
    if (unavailable) {
      Alert.alert(t("detailUnavailable"), unavailable);
      return;
    }
    applyMut.mutate();
  }

  function onSavePress() {
    void hapticLight();
    if (!token) {
      const returnTo = `/job/${encodeURIComponent(jobId)}`;
      void persistCandidateReturnIntent(returnTo, { kind: "save_job", jobId }).then(() => {
        router.push({
          pathname: "/login",
          params: { returnTo, pendingAction: "save_job", pendingTargetId: jobId },
        });
      });
      return;
    }
    saveMut.mutate();
  }

  const screenOptions = <Stack.Screen options={{ title: t("detailTitle"), headerShown: false }} />;
  const topBar = (showSave: boolean) => (
    <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
      <RoundButton icon="arrow-back" onPress={goBack} label={t("detailBack")} />
      {showSave ? (
        <RoundButton
          icon={saved ? "bookmark" : "bookmark-outline"}
          onPress={onSavePress}
          label={saved ? t("detailSaved") : t("jobsSave")}
          active={saved}
          disabled={saveMut.isPending || saved}
        />
      ) : null}
    </View>
  );

  if (!jobId.trim() || jobQuery.isError) {
    const invalid = !jobId.trim();
    return (
      <View style={styles.root}>
        {screenOptions}
        <DecorRing size={260} thickness={34} color="rgba(66,224,227,0.12)" style={{ top: -110, right: -110 }} />
        {topBar(false)}
        <View style={styles.stateWrap}>
          <BrandStatePanel
            tone="navy"
            icon={invalid ? "link-outline" : "cloud-offline-outline"}
            title={invalid ? t("detailInvalid") : t("detailLoadError")}
            body={invalid ? ac("This link doesn't point to a job we can find.") : t("retrySupport")}
            primary={
              invalid
                ? { label: t("detailBack"), icon: "arrow-back", onPress: goBack }
                : { label: t("retry"), icon: "refresh", onPress: () => void jobQuery.refetch() }
            }
          />
        </View>
      </View>
    );
  }

  if (jobQuery.isLoading) {
    return (
      <View style={styles.root}>
        {screenOptions}
        <DecorRing size={260} thickness={34} color="rgba(66,224,227,0.12)" style={{ top: -110, right: -110 }} />
        {topBar(false)}
        <View style={styles.heroSkeleton}>
          <SkeletonBox width={64} height={64} radius={18} />
          <SkeletonBox width="80%" height={26} radius={8} style={{ marginTop: 18 }} />
          <SkeletonBox width="55%" height={16} radius={6} style={{ marginTop: 10 }} />
        </View>
        <View style={[styles.sheet, styles.sheetFill]}>
          <JobDetailSkeleton />
        </View>
      </View>
    );
  }

  const job = jobQuery.data!;
  const employer = getJobEmployerLabel(job, locale);
  const logoUrl = getJobLogoUrl(job);
  const location = jobLocationLabel(job, locale);
  const salary = jobSalaryLabel(job, locale);
  const chips = hubListingChips(job, 6);
  const visaRoutes = visaRouteChips(job);
  const { mobility: mobilityItems, perks: perkItems } = splitMobilityAndPerks(job);
  const descriptionPlain = job.description ? stripHtmlToPlainText(job.description) : "";
  const jobTypeLabel = job.jobType ? String(job.jobType).replace(/-/g, " ") : "";
  const unavailableReason = applicationUnavailableReason(job, locale);
  const postedLabel = jobAgeLabel(job.createdAt, locale);

  return (
    <View style={styles.root}>
      {screenOptions}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollPad}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <DecorRing size={260} thickness={34} color="rgba(66,224,227,0.12)" style={{ top: -110, right: -110 }} />
          <DecorRing size={120} thickness={18} color="rgba(66,224,227,0.1)" style={{ bottom: 20, left: -60 }} />
          {topBar(true)}
          <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(400)} style={styles.heroBody}>
            <DepthSurface depth={4} radius={20} depthColor={colors.cyan} style={styles.logoSurface} innerStyle={styles.logoFace}>
              <CompanyLogo logoUrl={logoUrl} companyName={employer} size={52} radius={14} />
            </DepthSurface>
            <Text style={styles.heroCompany} numberOfLines={1}>{employer}</Text>
            <Text style={styles.heroTitle} numberOfLines={4} accessibilityRole="header">{job.title}</Text>
            {salary ? <Text style={styles.heroSalary}>{salary}</Text> : null}
            <View style={styles.heroFacts}>
              <HeroFact icon="location-outline" label={location} />
              <HeroFact icon="briefcase-outline" label={jobTypeLabel} />
              <HeroFact icon="trending-up-outline" label={job.experienceLevel ?? ""} />
              <HeroFact icon="time-outline" label={postedLabel ?? ""} />
            </View>
          </Animated.View>
        </View>

        <Animated.View
          entering={reducedMotion ? undefined : FadeInUp.delay(150).duration(400)}
          style={styles.sheet}
        >
          {chips.length > 0 ? (
            <View style={styles.chipRow}>
              {chips.map((c) => (
                <View key={c} style={styles.chip}>
                  <Text style={styles.chipText}>{jobChipLabel(c, locale)}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <CandidateCompatibilityCard jobId={jobId} />

          {job.summary ? (
            <>
              <SectionHeading title={t("detailOverview")} />
              <Text style={styles.bodyText}>{job.summary}</Text>
            </>
          ) : null}

          {descriptionPlain ? (
            <>
              <SectionHeading title={t("detailAbout")} />
              <Text style={styles.bodyText}>{descriptionPlain}</Text>
            </>
          ) : null}

          {visaRoutes.length > 0 || mobilityItems.length > 0 ? (
            <>
              <SectionHeading title={t("detailSupport")} />
              <View style={styles.supportList}>
                {visaRoutes.map((route) => (
                  <View key={`visa-${route}`} style={styles.supportRow}>
                    <View style={styles.supportIcon}>
                      <Ionicons name="id-card-outline" size={16} color={colors.navy} />
                    </View>
                    <Text style={styles.supportText}>{jobChipLabel(formatVisaRouteChip(route), locale)}</Text>
                  </View>
                ))}
                {mobilityItems.map((m) => (
                  <View key={m} style={styles.supportRow}>
                    <View style={styles.supportIcon}>
                      <Ionicons name="checkmark" size={16} color={colors.navy} />
                    </View>
                    <Text style={styles.supportText}>{jobChipLabel(m, locale)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {perkItems.length > 0 ? (
            <>
              <SectionHeading title={t("detailPerks")} />
              <View style={styles.supportList}>
                {perkItems.map((p) => (
                  <View key={p} style={styles.supportRow}>
                    <View style={styles.supportIcon}>
                      <Ionicons name="gift-outline" size={16} color={colors.navy} />
                    </View>
                    <Text style={styles.supportText}>{p}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {job.expiresAt ? (
            <>
              <SectionHeading title={t("detailDeadline")} />
              <View style={styles.deadlineRow}>
                <Ionicons name="calendar-outline" size={18} color={colors.navy} />
                <Text style={styles.deadlineText}>
                  {new Date(job.expiresAt).toLocaleDateString(intlLocale, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </>
          ) : null}

          {job.screeningQuestions?.length ? (
            <>
              <SectionHeading title={t("detailQuestions")} />
              <View style={styles.screeningList}>
                {job.screeningQuestions.map((question) => (
                  <View key={question.id} style={styles.screeningQuestion}>
                    <Text style={styles.screeningLabel}>
                      {question.question}
                      {question.required !== false ? <Text style={styles.required}> *</Text> : null}
                    </Text>
                    {question.type === "yes_no" ? (
                      <View style={styles.answerChoices}>
                        {(["yes", "no"] as const).map((answer) => {
                          const selected = screeningAnswers[question.id] === answer;
                          return (
                            <Pressable
                              key={answer}
                              style={[styles.answerChoice, selected && styles.answerChoiceSelected]}
                              onPress={() => setScreeningAnswers((current) => ({ ...current, [question.id]: answer }))}
                              accessibilityRole="radio"
                              accessibilityState={{ selected }}
                            >
                              <Text style={[styles.answerChoiceText, selected && styles.answerChoiceTextSelected]}>
                                {answer === "yes" ? t("detailYes") : t("detailNo")}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : (
                      <TextInput
                        style={styles.screeningInput}
                        multiline
                        placeholder={t("detailAnswer")}
                        placeholderTextColor={colors.placeholder}
                        value={screeningAnswers[question.id] ?? ""}
                        onChangeText={(answer) => setScreeningAnswers((current) => ({ ...current, [question.id]: answer }))}
                        maxLength={1000}
                        textAlignVertical="top"
                      />
                    )}
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <SectionHeading title={t("detailNote")} />
          <Text style={styles.coverHint}>{t("detailNoteHelp")}</Text>
          <TextInput
            style={styles.cover}
            multiline
            placeholder={t("detailNotePlaceholder")}
            placeholderTextColor={colors.placeholder}
            value={coverLetter}
            onChangeText={setCoverLetter}
            textAlignVertical="top"
          />

          {profileQuery.isSuccess && !resumeUrl ? (
            <DepthPressable
              onPress={() => router.push("/(tabs)/profile")}
              face={colors.navy}
              depthColor={colors.cyan}
              depth={4}
              radius={18}
              style={styles.cvCardWrap}
              innerStyle={styles.cvCard}
              accessibilityLabel={t("detailAddCv")}
            >
              <View style={styles.cvIcon}>
                <Ionicons name="document-attach-outline" size={20} color={colors.navy} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.cvText}>{t("detailCvHelp")}</Text>
                <Text style={styles.cvLink}>{t("detailAddCv")}</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={colors.cyan} />
            </DepthPressable>
          ) : null}

          <View style={styles.actions}>
            {unavailableReason ? (
              <View style={styles.unavailableBanner}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.navy} />
                <Text style={styles.unavailableText}>{unavailableReason}</Text>
              </View>
            ) : null}
            <Text style={styles.applyNote}>{t("detailSharing")}</Text>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.persistentBar, { paddingBottom: Math.max(insets.bottom, 10) + 4 }]}>
        <DepthPressable
          onPress={onSavePress}
          disabled={saveMut.isPending || saved}
          face={saved ? colors.cyan : colors.white}
          depthColor={colors.navy}
          depth={4}
          radius={18}
          borderColor={colors.navy}
          borderWidth={2}
          accessibilityLabel={saved ? t("detailSaved") : t("jobsSave")}
          innerStyle={styles.persistentSave}
        >
          <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={20} color={colors.navy} />
          <Text style={styles.persistentSaveText}>{saved ? t("detailSaved") : t("detailSave")}</Text>
        </DepthPressable>
        <DepthButton
          title={unavailableReason ? t("detailUnavailable") : t("detailApply")}
          onPress={onApplyPress}
          variant="cyan"
          loading={applyMut.isPending}
          disabled={Boolean(unavailableReason) || profileQuery.isLoading}
          icon={unavailableReason ? null : "arrow-forward"}
          style={styles.persistentApply}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy, overflow: "hidden" },
  scrollPad: { flexGrow: 1, backgroundColor: colors.white },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  roundButtonOn: { backgroundColor: colors.cyan, borderColor: colors.cyan },

  hero: {
    backgroundColor: colors.navy,
    paddingBottom: 44,
    overflow: "hidden",
  },
  heroBody: { paddingHorizontal: 20, paddingTop: 18 },
  logoSurface: { alignSelf: "flex-start" },
  logoFace: { padding: 6 },
  heroCompany: {
    marginTop: 16,
    fontSize: 12,
    fontFamily: fontFamily.extraBold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.cyan,
  },
  heroTitle: {
    marginTop: 6,
    fontSize: 28,
    lineHeight: 32,
    fontFamily: fontFamily.heading,
    letterSpacing: -0.6,
    color: colors.white,
  },
  heroSalary: {
    marginTop: 10,
    fontSize: 18,
    fontFamily: fontFamily.extraBold,
    color: colors.cyan,
  },
  heroFacts: { marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  heroFact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.1)",
    maxWidth: "100%",
  },
  heroFactText: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: "rgba(255,255,255,0.85)",
    textTransform: "capitalize",
    flexShrink: 1,
  },
  heroSkeleton: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 44 },

  sheet: {
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.white,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 24,
  },
  sheetFill: { flex: 1, marginTop: 0 },
  stateWrap: { flex: 1, justifyContent: "center", paddingHorizontal: 16, paddingBottom: 60 },
  skeletonPad: { paddingTop: 4 },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.pale,
  },
  chipText: { fontSize: 11, fontFamily: fontFamily.bold, color: colors.navy },

  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    marginTop: 26,
  },
  sectionRule: {
    width: 6,
    height: 20,
    borderRadius: 3,
    backgroundColor: colors.cyan,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.3,
  },
  bodyText: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 24,
  },
  supportList: { gap: 10 },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.white,
  },
  supportIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  supportText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  deadlineRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  deadlineText: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.navy },

  screeningList: { gap: 12 },
  screeningQuestion: {
    padding: 14,
    gap: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.white,
  },
  screeningLabel: { fontSize: 14, lineHeight: 20, fontFamily: fontFamily.semiBold, color: colors.navy },
  required: { color: colors.error },
  answerChoices: { flexDirection: "row", gap: 9 },
  answerChoice: {
    minWidth: 76,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.white,
  },
  answerChoiceSelected: { backgroundColor: colors.navy },
  answerChoiceText: { fontSize: 13, fontFamily: fontFamily.bold, color: colors.navy },
  answerChoiceTextSelected: { color: colors.cyan },
  screeningInput: {
    minHeight: 84,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.pale,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
  },

  coverHint: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    marginBottom: 10,
    lineHeight: 19,
  },
  cover: {
    minHeight: 110,
    borderWidth: 2,
    borderColor: colors.navy,
    borderRadius: 18,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    textAlignVertical: "top",
  },

  cvCardWrap: { marginTop: 18 },
  cvCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  cvIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  cvText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.medium,
    color: "rgba(255,255,255,0.85)",
  },
  cvLink: { marginTop: 2, fontSize: 14, fontFamily: fontFamily.extraBold, color: colors.cyan },

  actions: { marginTop: 24, gap: 12 },
  unavailableBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.pale,
  },
  unavailableText: { flex: 1, fontSize: 13, lineHeight: 18, fontFamily: fontFamily.semiBold, color: colors.navy },
  applyNote: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },

  persistentBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 2,
    borderTopColor: colors.pale,
  },
  persistentSave: {
    minWidth: 76,
    height: 52,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  persistentSaveText: { fontSize: 11, fontFamily: fontFamily.bold, color: colors.navy },
  persistentApply: { flex: 1 },
});
