import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { CompanyLogo } from "@/components/CompanyLogo";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { SkeletonBox } from "@/components/SkeletonLoader";
import { applyToJob, fetchJobById, fetchOwnProfile, saveJob } from "@/lib/api-client";
import { hapticLight, hapticSuccess, hapticWarning } from "@/lib/haptics";
import { getJobEmployerLabel, getJobLogoUrl, hubListingChips } from "@/lib/job-display";
import { mobilityChipStyle } from "@/lib/mobility-chip-styles";
import { colors, fontFamily, radii } from "@/lib/theme";

function errMsg(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "Something went wrong.";
}

function formatSalary(minSalary?: number, maxSalary?: number, currency = "GBP"): string {
  const sym = currency === "GBP" ? "£" : currency === "EUR" ? "€" : currency === "USD" ? "$" : `${currency} `;
  if (minSalary != null && maxSalary != null) return `${sym}${minSalary.toLocaleString()}–${maxSalary.toLocaleString()}`;
  if (minSalary != null) return `From ${sym}${minSalary.toLocaleString()}`;
  return "";
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
        <SkeletonBox width={72} height={72} radius={18} />
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
  const jobId = String(id || "");
  const [coverLetter, setCoverLetter] = useState("");
  const [saved, setSaved] = useState(false);

  const jobQuery = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJobById(jobId),
    enabled: !!jobId.trim(),
  });

  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchOwnProfile,
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
        Alert.alert("Could not save", msg);
      }
    },
  });

  const applyMut = useMutation({
    mutationFn: () => applyToJob(jobId, coverLetter.trim() || undefined, resumeUrl || undefined),
    onSuccess: () => {
      void hapticSuccess();
      void qc.invalidateQueries({ queryKey: ["applications"] });
      void qc.invalidateQueries({ queryKey: ["analytics", "candidate-dashboard"] });
      Alert.alert(
        "Application sent ✓",
        "The employer can see your profile and CV. You'll hear back via Messages.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    },
    onError: (e: unknown) => {
      void hapticWarning();
      Alert.alert("Could not apply", errMsg(e));
    },
  });

  function onApplyPress() {
    if (profileQuery.isLoading) {
      Alert.alert("Please wait", "Loading your profile…");
      return;
    }
    if (!resumeUrl) {
      Alert.alert(
        "CV required",
        "Upload your CV on your Profile tab before applying — employers need it to review you.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go to Profile", onPress: () => router.push("/(tabs)/profile") },
        ]
      );
      return;
    }
    applyMut.mutate();
  }

  function onSavePress() {
    void hapticLight();
    saveMut.mutate();
  }

  // — Error / empty states —
  if (!jobId.trim()) {
    return (
      <View style={styles.center}>
        <Ionicons name="link-outline" size={44} color={colors.borderStrong} />
        <Text style={styles.errTitle}>Invalid job link</Text>
        <Pressable style={styles.ghostBtn} onPress={() => router.back()}>
          <Text style={styles.ghostBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (jobQuery.isError) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={44} color={colors.borderStrong} />
        <Text style={styles.errTitle}>Couldn't load this role</Text>
        <Text style={styles.errSub}>Check your connection and try again.</Text>
        <Pressable style={styles.ghostBtn} onPress={() => void jobQuery.refetch()}>
          <Text style={styles.ghostBtnText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  // — Skeleton while loading —
  if (jobQuery.isLoading) {
    return (
      <View style={styles.root}>
        <View style={styles.skeletonNavBar} />
        <ScrollView>
          <JobDetailSkeleton />
        </ScrollView>
      </View>
    );
  }

  const job = jobQuery.data!;
  const employer = getJobEmployerLabel(job);
  const logoUrl = getJobLogoUrl(job);
  const location = [job.locationCity, job.locationCountry].filter(Boolean).join(", ") || job.location || "";
  const salary = formatSalary(job.minSalary, job.maxSalary, job.salaryCurrency);
  const chips = hubListingChips(job, 6);

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>

          {/* ── Hero ── */}
          <Animated.View entering={FadeIn.duration(400)}>
            <LinearGradient
              colors={[colors.navy, colors.navyDeep]}
              style={styles.hero}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
            >
              <View style={styles.heroTop}>
                <CompanyLogo logoUrl={logoUrl} companyName={employer} size={72} radius={18} />
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
                {job.jobType ? (
                  <View style={styles.heroMetaRow}>
                    <Ionicons name="briefcase-outline" size={14} color="rgba(255,255,255,0.55)" />
                    <Text style={styles.heroMetaText}>{job.jobType}</Text>
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
                    const pal = mobilityChipStyle(c);
                    return (
                      <View key={c} style={[styles.chip, { backgroundColor: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.22)" }]}>
                        <Text style={[styles.chipText, { color: "rgba(255,255,255,0.9)" }]} numberOfLines={1}>{c}</Text>
                      </View>
                    );
                  })}
                </View>
              ) : null}

              {/* Save button in hero */}
              <Pressable
                style={[styles.saveHeroBtn, saved && styles.saveHeroBtnSaved]}
                onPress={onSavePress}
                disabled={saveMut.isPending || saved}
                accessibilityRole="button"
                accessibilityLabel={saved ? "Job saved" : "Save this job"}
              >
                <Ionicons
                  name={saved ? "bookmark" : "bookmark-outline"}
                  size={18}
                  color={saved ? colors.teal : "rgba(255,255,255,0.8)"}
                />
                <Text style={[styles.saveHeroBtnText, saved && { color: colors.teal }]}>
                  {saved ? "Saved" : "Save role"}
                </Text>
              </Pressable>
            </LinearGradient>
          </Animated.View>

          {/* ── Body content ── */}
          <Animated.View entering={FadeInUp.delay(150).duration(400)} style={styles.body}>

            {job.summary ? (
              <>
                <SectionHeading title="Overview" />
                <Text style={styles.bodyText}>{job.summary}</Text>
              </>
            ) : null}

            {job.description ? (
              <>
                <SectionHeading title="About the role" />
                <Text style={styles.bodyText}>{job.description}</Text>
              </>
            ) : null}

            {job.mobility && job.mobility.length > 0 ? (
              <>
                <SectionHeading title="Sponsorship & mobility" />
                <View style={styles.mobilityList}>
                  {job.mobility.map((m) => (
                    <View key={m} style={styles.mobilityRow}>
                      <Ionicons name="checkmark-circle" size={18} color={colors.teal} />
                      <Text style={styles.mobilityText}>{m}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}

            {/* Cover letter */}
            <SectionHeading title="Cover note (optional)" />
            <Text style={styles.coverHint}>
              A short, direct note works best — why this role, why now.
            </Text>
            <TextInput
              style={styles.cover}
              multiline
              placeholder="Two or three sentences is enough…"
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
                  Your CV isn't uploaded yet — employers need it to consider you.{" "}
                  <Text style={styles.cvBannerLink}>Add it to your profile →</Text>
                </Text>
              </Pressable>
            ) : null}

            {/* Apply CTA */}
            <View style={styles.actions}>
              <GshGradientPrimaryButton
                title={applyMut.isPending ? "Sending application…" : "Apply now"}
                onPress={onApplyPress}
                disabled={applyMut.isPending || profileQuery.isLoading}
              />
              <Text style={styles.applyNote}>
                Your profile and CV are sent to the employer. You can track the status in Applications.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceLight },
  scrollPad: { paddingBottom: 48 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 14,
    backgroundColor: colors.surfaceLight,
  },

  // Skeleton
  skeletonNavBar: { height: 56, backgroundColor: colors.navyDeep },
  skeletonPad: { padding: 20, gap: 0 },
  skeletonHero: { flexDirection: "row", gap: 14, alignItems: "flex-start" },

  // Hero
  hero: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
    gap: 16,
  },
  heroTop: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  heroText: { flex: 1, minWidth: 0 },
  heroTitle: {
    fontSize: 22,
    fontFamily: fontFamily.extraBold,
    color: colors.white,
    letterSpacing: -0.4,
    lineHeight: 28,
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

  // Save btn in hero
  saveHeroBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  saveHeroBtnSaved: {
    backgroundColor: "rgba(14,205,209,0.12)",
    borderColor: "rgba(14,205,209,0.35)",
  },
  saveHeroBtnText: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: "rgba(255,255,255,0.8)",
  },

  // Body
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 0,
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
    fontFamily: fontFamily.bold,
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
    backgroundColor: "rgba(14,205,209,0.07)",
    borderWidth: 1,
    borderColor: "rgba(14,205,209,0.2)",
  },
  mobilityText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
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
    fontSize: 15,
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
  applyNote: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },

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
    borderRadius: radii.md,
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
