import { useAppCopy } from "@/lib/i18n";
import { appCopy, type AppLanguage } from "@/lib/i18n/catalog";
import { jobChipLabel } from "@/lib/job-presentation";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { CompanyLogo } from "@/components/CompanyLogo";
import { CandidateCompatibilityCard } from "@/components/CandidateCompatibilityCard";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshScreenBackground } from "@/components/GshScreenBackground";
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
import { STACK_HEADER_BODY_GAP } from "@/lib/screen-layout";
import { colors, fontFamily, navHeader, radii } from "@/lib/theme";
import type { Job, ScreeningAnswer } from "@/types/models";

function errMsg(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "Something went wrong.";
}

function formatSalary(minSalary?: number, maxSalary?: number, currency = "GBP", locale: AppLanguage = "en"): string {
  const sym = currency === "GBP" ? "£" : currency === "EUR" ? "€" : currency === "USD" ? "$" : `${currency} `;
  if (minSalary != null && maxSalary != null) return `${sym}${minSalary.toLocaleString(locale)}–${maxSalary.toLocaleString(locale)}`;
  if (minSalary != null) return appCopy(locale, "jobsSalaryFrom", { amount: `${sym}${minSalary.toLocaleString(locale)}` });
  return "";
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

function InfoRow({ icon, label }: { icon: string; label: string }) {
  if (!label) return null;
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={16} color={colors.textMuted} />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.sectionHead}>
      <View style={styles.sectionRule} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function JobDetailSkeleton() {
  return (
    <View style={styles.skeletonPad}>
      <View style={styles.skeletonHero}>
        <SkeletonBox width={56} height={56} radius={14} />
        <View style={{ flex: 1, gap: 10 }}>
          <SkeletonBox width="80%" height={22} radius={7} />
          <SkeletonBox width="55%" height={16} radius={6} />
          <SkeletonBox width="65%" height={13} radius={5} />
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
        <SkeletonBox width={110} height={26} radius={99} />
        <SkeletonBox width={90} height={26} radius={99} />
      </View>
      <SkeletonBox width="100%" height={1} radius={0} style={{ marginTop: 20, backgroundColor: colors.border }} />
      <SkeletonBox width="40%" height={14} radius={5} style={{ marginTop: 20 }} />
      <SkeletonBox width="100%" height={12} radius={5} style={{ marginTop: 12 }} />
      <SkeletonBox width="95%" height={12} radius={5} style={{ marginTop: 8 }} />
      <SkeletonBox width="85%" height={12} radius={5} style={{ marginTop: 8 }} />
      <SkeletonBox width="90%" height={12} radius={5} style={{ marginTop: 8 }} />
    </View>
  );
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { t, locale } = useAppCopy();
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
    onError: (e: unknown) => {
      void hapticWarning();
      Alert.alert(t("detailApplyError"), t("detailApplyErrorHelp"));
    },
  });

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

  // — Error / empty states —
  if (!jobId.trim()) {
    return (
      <GshScreenBackground>
        <View style={styles.center}>
          <Ionicons name="link-outline" size={44} color={colors.borderStrong} />
          <Text style={styles.errTitle}>{t("detailInvalid")}</Text>
          <Pressable style={styles.ghostBtn} onPress={() => router.back()}>
            <Text style={styles.ghostBtnText}>{t("detailBack")}</Text>
          </Pressable>
        </View>
      </GshScreenBackground>
    );
  }

  if (jobQuery.isError) {
    return (
      <GshScreenBackground>
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={44} color={colors.borderStrong} />
          <Text style={styles.errTitle}>{t("detailLoadError")}</Text>
          <Text style={styles.errSub}>{t("retrySupport")}</Text>
          <Pressable style={styles.ghostBtn} onPress={() => void jobQuery.refetch()}>
            <Text style={styles.ghostBtnText}>{t("retry")}</Text>
          </Pressable>
        </View>
      </GshScreenBackground>
    );
  }

  // — Skeleton while loading —
  if (jobQuery.isLoading) {
    return (
      <GshScreenBackground>
        <Stack.Screen options={{ title: t("detailTitle"), ...navHeader }} />
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>
            <View style={styles.skeletonHeroBand}>
              <JobDetailSkeleton />
            </View>
          </ScrollView>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  const job = jobQuery.data!;
  const employer = getJobEmployerLabel(job, locale);
  const logoUrl = getJobLogoUrl(job);
  const location = [job.locationCity, job.locationCountry].filter(Boolean).join(", ") || job.location || "";
  const salary = formatSalary(job.minSalary, job.maxSalary, job.salaryCurrency, locale);
  const chips = hubListingChips(job, 6);
  const visaRoutes = visaRouteChips(job);
  const { mobility: mobilityItems, perks: perkItems } = splitMobilityAndPerks(job);
  const descriptionPlain = job.description ? stripHtmlToPlainText(job.description) : "";
  const jobTypeLabel = job.jobType ? String(job.jobType).replace(/-/g, " ") : "";
  const unavailableReason = applicationUnavailableReason(job, locale);

  return (
    <GshScreenBackground>
      <Stack.Screen options={{ title: t("detailTitle"), ...navHeader }} />
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>

          {/* ── Hero ── */}
          <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(400)}>
            <View style={styles.hero}>
              <View style={styles.heroTop}>
                <CompanyLogo logoUrl={logoUrl} companyName={employer} size={56} radius={14} />
                <View style={styles.heroText}>
                  <Text style={styles.heroTitle} numberOfLines={3}>{job.title}</Text>
                  <Text style={styles.heroCompany} numberOfLines={1}>{employer}</Text>
                </View>
              </View>

              <View style={styles.heroMeta}>
                {location ? (
                  <View style={styles.heroMetaRow}>
                    <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.55)" />
                    <Text style={styles.heroMetaText}>{location}</Text>
                  </View>
                ) : null}
                {jobTypeLabel ? (
                  <View style={styles.heroMetaRow}>
                    <Ionicons name="briefcase-outline" size={14} color="rgba(255,255,255,0.55)" />
                    <Text style={styles.heroMetaText}>{jobTypeLabel}</Text>
                  </View>
                ) : null}
                {job.experienceLevel ? (
                  <View style={styles.heroMetaRow}>
                    <Ionicons name="trending-up-outline" size={14} color="rgba(255,255,255,0.55)" />
                    <Text style={styles.heroMetaText}>{job.experienceLevel}</Text>
                  </View>
                ) : null}
                {salary ? (
                  <View style={styles.heroMetaRow}>
                    <Ionicons name="cash-outline" size={14} color="rgba(255,255,255,0.55)" />
                    <Text style={[styles.heroMetaText, styles.heroSalary]}>{salary}</Text>
                  </View>
                ) : null}
              </View>

              {/* Chips */}
              {chips.length > 0 ? (
                <View style={styles.chipRow}>
                  {chips.map((c) => {
                    
                    return (
                      <View key={c} style={[styles.chip, { backgroundColor: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.22)" }]}>
                        <Text style={[styles.chipText, { color: "rgba(255,255,255,0.9)" }]} >{jobChipLabel(c, locale)}</Text>
                      </View>
                    );
                  })}
                </View>
              ) : null}

            </View>
          </Animated.View>

          {/* ── Body content ── */}
          <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(150).duration(400)} style={styles.body}>

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
                <View style={styles.mobilityList}>
                  {visaRoutes.map((route) => (
                    <View key={`visa-${route}`} style={styles.mobilityRow}>
                      <Ionicons name="id-card-outline" size={18} color={colors.accent} />
                      <Text style={styles.mobilityText}>{jobChipLabel(formatVisaRouteChip(route), locale)}</Text>
                    </View>
                  ))}
                  {mobilityItems.map((m) => (
                    <View key={m} style={styles.mobilityRow}>
                      <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                      <Text style={styles.mobilityText}>{jobChipLabel(m, locale)}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}

            {perkItems.length > 0 ? (
              <>
                <SectionHeading title={t("detailPerks")} />
                <View style={styles.mobilityList}>
                  {perkItems.map((p) => (
                    <View key={p} style={styles.mobilityRow}>
                      <Ionicons name="gift-outline" size={18} color={colors.accent} />
                      <Text style={styles.mobilityText}>{p}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}

            {job.expiresAt ? (
              <>
                <SectionHeading title={t("detailDeadline")} />
                <Text style={styles.bodyText}>
                  {new Date(job.expiresAt).toLocaleDateString(locale, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
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

            {/* Cover letter */}
            <SectionHeading title={t("detailNote")} />
            <Text style={styles.coverHint}>
              {t("detailNoteHelp")}
            </Text>
            <TextInput
              style={styles.cover}
              multiline
              placeholder={t("detailNotePlaceholder")}
              placeholderTextColor={colors.placeholder}
              value={coverLetter}
              onChangeText={setCoverLetter}
              textAlignVertical="top"
            />

            {/* CV warning */}
            {profileQuery.isSuccess && !resumeUrl ? (
              <Pressable
                style={styles.cvBanner}
                onPress={() => router.push("/(tabs)/profile")}
                accessibilityRole="button"
              >
                <Ionicons name="warning-outline" size={20} color="#92400e" />
                <Text style={styles.cvBannerText}>
                  {t("detailCvHelp")}{" "}
                  <Text style={styles.cvBannerLink}>{t("detailAddCv")}</Text>
                </Text>
              </Pressable>
            ) : null}

            {/* Apply guidance; the action remains visible in the native bottom bar. */}
            <View style={styles.actions}>
              {unavailableReason ? (
                <View style={styles.unavailableBanner}>
                  <Ionicons name="lock-closed-outline" size={18} color="#92400e" />
                  <Text style={styles.unavailableText}>{unavailableReason}</Text>
                </View>
              ) : null}
              <Text style={styles.applyNote}>
                {t("detailSharing")}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
        <View style={styles.persistentBar}>
          <Pressable
            style={[styles.persistentSave, saved && styles.persistentSaveSaved]}
            onPress={onSavePress}
            disabled={saveMut.isPending || saved}
            accessibilityRole="button"
            accessibilityLabel={saved ? t("detailSaved") : t("jobsSave")}
          >
            <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={20} color={colors.navy} />
            <Text style={styles.persistentSaveText}>{saved ? t("detailSaved") : t("detailSave")}</Text>
          </Pressable>
          <GshGradientPrimaryButton
            title={unavailableReason ? t("detailUnavailable") : t("detailApply")}
            onPress={onApplyPress}
            loading={applyMut.isPending}
            disabled={Boolean(unavailableReason) || profileQuery.isLoading}
            containerStyle={styles.persistentApply}
          />
        </View>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollPad: { paddingBottom: 24 },
  skeletonHeroBand: {
    paddingHorizontal: 16,
    paddingTop: STACK_HEADER_BODY_GAP,
    paddingBottom: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 14,
  },

  // Skeleton
  skeletonPad: { paddingHorizontal: 16, paddingTop: 4, gap: 0 },
  skeletonHero: { flexDirection: "row", gap: 14, alignItems: "flex-start" },

  // Hero
  hero: {
    backgroundColor: colors.navy,
    paddingTop: STACK_HEADER_BODY_GAP,
    paddingBottom: 22,
    paddingHorizontal: 16,
    gap: 14,
  },
  heroTop: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  heroText: { flex: 1, minWidth: 0 },
  heroTitle: {
    fontSize: 20,
    fontFamily: fontFamily.heading,
    color: colors.white,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  heroCompany: {
    marginTop: 6,
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: "rgba(255,255,255,0.75)",
  },
  heroMeta: { gap: 8 },
  heroMetaRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  heroMetaText: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.6)",
  },
  heroSalary: {
    fontFamily: fontFamily.bold,
    color: colors.teal,
    fontSize: 14,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  chipText: { fontSize: 11, fontFamily: fontFamily.semiBold },

  // Body
  body: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 0,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    marginTop: 24,
  },
  sectionRule: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.teal,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.2,
  },
  bodyText: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 24,
  },
  mobilityList: { gap: 10 },
  mobilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    backgroundColor: colors.brandSoft,
    borderWidth: 1,
    borderColor: colors.teal,
  },
  mobilityText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
  },

  screeningList: { gap: 12 },
  screeningQuestion: {
    padding: 14,
    gap: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  screeningLabel: { fontSize: 14, lineHeight: 20, fontFamily: fontFamily.semiBold, color: colors.textPrimary },
  required: { color: colors.error },
  answerChoices: { flexDirection: "row", gap: 9 },
  answerChoice: {
    minWidth: 76,
    minHeight: 44,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceMuted,
  },
  answerChoiceSelected: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  answerChoiceText: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textSecondary },
  answerChoiceTextSelected: { color: colors.brandDeep },
  screeningInput: {
    minHeight: 84,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
  },

  // Cover letter
  coverHint: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    marginBottom: 10,
    lineHeight: 19,
  },
  cover: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    textAlignVertical: "top",
  },

  // CV banner
  cvBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 16,
    padding: 14,
    borderRadius: radii.md,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  cvBannerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: "#92400e",
    lineHeight: 20,
  },
  cvBannerLink: {
    fontFamily: fontFamily.bold,
    textDecorationLine: "underline",
  },

  // Actions
  actions: { marginTop: 28, gap: 12 },
  unavailableBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "#fed7aa",
    backgroundColor: "#fff7ed",
  },
  unavailableText: { flex: 1, fontSize: 13, lineHeight: 18, fontFamily: fontFamily.semiBold, color: "#92400e" },
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
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  persistentSave: {
    minWidth: 76,
    paddingHorizontal: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.white,
  },
  persistentSaveSaved: { backgroundColor: colors.brandSoft, borderColor: colors.teal },
  persistentSaveText: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.navy },
  persistentApply: { flex: 1 },

  // Error / ghost
  errTitle: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    textAlign: "center",
  },
  errSub: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  ghostBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  ghostBtnText: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
    textAlign: "center",
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoLabel: { fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted },
});
