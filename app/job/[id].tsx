import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { applyToJob, fetchJobById, fetchOwnProfile, saveJob } from "@/lib/api-client";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

function errMsg(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "Something went wrong.";
}

async function safeSuccessHaptic() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* Web / simulator — ignore */
  }
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const jobId = String(id || "");

  const [coverLetter, setCoverLetter] = useState("");

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
    profileQuery.data &&
    typeof (profileQuery.data as { resume?: unknown }).resume === "string"
      ? String((profileQuery.data as { resume: string }).resume).trim()
      : "";

  const profileReady = profileQuery.isSuccess;

  const saveMut = useMutation({
    mutationFn: () => saveJob(jobId),
    onSuccess: () => {
      void safeSuccessHaptic();
      void qc.invalidateQueries({ queryKey: ["saved-jobs"] });
      void qc.invalidateQueries({ queryKey: ["analytics", "candidate-dashboard"] });
      Alert.alert("Saved", "Job saved to your list.");
    },
    onError: (e: unknown) => {
      const msg = errMsg(e);
      if (msg.includes("already saved")) Alert.alert("Already saved", "This job is in your saved list.");
      else Alert.alert("Could not save", msg);
    },
  });

  const applyMut = useMutation({
    mutationFn: () => applyToJob(jobId, coverLetter.trim() || undefined, resumeUrl || undefined),
    onSuccess: () => {
      void safeSuccessHaptic();
      void qc.invalidateQueries({ queryKey: ["applications"] });
      void qc.invalidateQueries({ queryKey: ["analytics", "candidate-dashboard"] });
      Alert.alert("Application sent", "The employer will see your profile and CV for this role.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (e: unknown) => Alert.alert("Could not apply", errMsg(e)),
  });

  function onApplyPress() {
    if (profileQuery.isLoading) {
      Alert.alert("Please wait", "Loading your profile…");
      return;
    }
    if (profileQuery.isError) {
      Alert.alert(
        "Profile unavailable",
        "We couldn't load your profile. Check your connection, then open Profile to confirm your CV is uploaded.",
        [{ text: "OK" }]
      );
      return;
    }
    if (!resumeUrl) {
      Alert.alert(
        "CV required",
        "Upload your CV on your profile before applying. Employers need your résumé to review your application.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go to Profile", onPress: () => router.push("/(tabs)/profile") },
        ]
      );
      return;
    }
    applyMut.mutate();
  }

  if (!jobId.trim()) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <View style={styles.center}>
            <Ionicons name="link-outline" size={44} color={colors.borderStrong} />
            <Text style={styles.errTitle}>This job link is not valid.</Text>
            <Pressable style={styles.secondaryBtn} onPress={() => router.back()} accessibilityRole="button">
              <Text style={styles.secondaryBtnText}>Go back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  if (jobQuery.isLoading) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.loadingText}>Loading role…</Text>
          </View>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  if (jobQuery.isError || jobQuery.data == null) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <View style={styles.center}>
            <Ionicons name="document-text-outline" size={44} color={colors.borderStrong} />
            <Text style={styles.errTitle}>This job could not be loaded.</Text>
            <Text style={styles.errSub}>Check your connection and try again.</Text>
            <Pressable style={styles.secondaryBtn} onPress={() => void jobQuery.refetch()} accessibilityRole="button">
              <Text style={styles.secondaryBtnText}>Retry</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtnMuted} onPress={() => router.back()} accessibilityRole="button">
              <Text style={styles.secondaryBtnMutedText}>Go back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  const job = jobQuery.data;

  const location = [job.locationCity, job.locationCountry].filter(Boolean).join(", ") || job.location || "";

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <View style={[styles.heroShell, cardSurfaceStyle(true)]}>
            <View style={styles.heroAccent} />
            <View style={styles.heroInner}>
              <Text style={styles.title}>{job.title}</Text>
              <Text style={styles.company}>{job.companyName || "Employer"}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                <Text style={styles.meta}>
                  {location}
                  {job.jobType ? ` · ${job.jobType}` : ""}
                </Text>
              </View>
            </View>
          </View>

          {job.summary ? (
            <>
              <GshSectionTitle title="Overview" topSpacing="sm" />
              <Text style={styles.sectionBody}>{job.summary}</Text>
            </>
          ) : null}

          {job.description ? (
            <>
              <GshSectionTitle title="Description" />
              <Text style={styles.sectionBody}>{job.description}</Text>
            </>
          ) : null}

          {job.mobility && job.mobility.length > 0 ? (
            <>
              <GshSectionTitle title="Mobility & sponsorship" />
              <Text style={styles.sectionBody}>{job.mobility.join(" · ")}</Text>
            </>
          ) : null}

          <GshSectionTitle title="Cover letter (optional)" />
          <TextInput
            style={styles.cover}
            multiline
            placeholder="A short note to the hiring team…"
            placeholderTextColor={colors.placeholder}
            value={coverLetter}
            onChangeText={setCoverLetter}
          />

          {profileReady && !resumeUrl ? (
            <View style={styles.cvBanner}>
              <Ionicons name="document-text-outline" size={22} color={colors.warningText} />
              <Text style={styles.cvBannerText}>
                Upload your CV on the Profile tab to apply. Employers only receive applications that include a résumé.
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <GshGradientPrimaryButton
              title={saveMut.isPending ? "Saving…" : "Save job"}
              onPress={() => saveMut.mutate()}
              disabled={saveMut.isPending}
            />
            <GshGradientPrimaryButton
              title={applyMut.isPending ? "Applying…" : "Apply now"}
              onPress={onApplyPress}
              disabled={applyMut.isPending || profileQuery.isLoading}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  loadingText: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.textMuted },
  errTitle: {
    color: colors.navy,
    textAlign: "center",
    fontSize: 17,
    fontFamily: fontFamily.bold,
    marginBottom: 8,
  },
  errSub: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  heroShell: { flexDirection: "row", marginBottom: 8, borderRadius: radii.lg, overflow: "hidden" },
  heroAccent: { width: 5, backgroundColor: colors.teal },
  heroInner: { flex: 1, padding: 18 },
  title: { fontSize: 24, fontFamily: fontFamily.extraBold, color: colors.navy, letterSpacing: -0.45 },
  company: { marginTop: 10, fontSize: 17, fontFamily: fontFamily.semiBold, color: colors.textMarketing },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  meta: { flex: 1, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted },
  sectionBody: {
    marginTop: 8,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 23,
  },
  cover: {
    marginTop: 10,
    minHeight: 100,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.92)",
    borderRadius: radii.lg,
    padding: 14,
    fontSize: 15,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    textAlignVertical: "top",
  },
  cvBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 16,
    padding: 14,
    borderRadius: radii.md,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  cvBannerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.warningText,
    lineHeight: 20,
  },
  actions: { marginTop: 20, gap: 12 },
  secondaryBtn: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.brand,
    backgroundColor: colors.background,
  },
  secondaryBtnText: { color: colors.brand, fontFamily: fontFamily.semiBold, fontSize: 16, textAlign: "center" },
  secondaryBtnMuted: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryBtnMutedText: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    textAlign: "center",
  },
});
