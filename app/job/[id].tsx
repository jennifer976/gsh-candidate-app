import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { applyToJob, fetchJobById, saveJob } from "@/lib/api-client";
import { colors } from "@/lib/theme";

function errMsg(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "Something went wrong.";
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
    enabled: !!jobId,
  });

  const saveMut = useMutation({
    mutationFn: () => saveJob(jobId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["saved-jobs"] });
      Alert.alert("Saved", "Job saved to your list.");
    },
    onError: (e: unknown) => {
      const msg = errMsg(e);
      if (msg.includes("already saved")) Alert.alert("Already saved", "This job is in your saved list.");
      else Alert.alert("Could not save", msg);
    },
  });

  const applyMut = useMutation({
    mutationFn: () => applyToJob(jobId, coverLetter.trim() || undefined),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["applications"] });
      Alert.alert("Application sent", "The employer will see your profile for this role.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (e: unknown) => Alert.alert("Could not apply", errMsg(e)),
  });

  const job = jobQuery.data;

  if (jobQuery.isLoading || !job) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  if (jobQuery.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <View style={styles.center}>
          <Text style={styles.err}>This job could not be loaded.</Text>
          <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
            <Text style={styles.secondaryBtnText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const location = [job.locationCity, job.locationCountry].filter(Boolean).join(", ") || job.location || "";

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.company}>{job.companyName || "Employer"}</Text>
        <Text style={styles.meta}>
          {location}
          {job.jobType ? ` · ${job.jobType}` : ""}
        </Text>

        {job.summary ? <Text style={styles.sectionBody}>{job.summary}</Text> : null}

        {job.description ? (
          <>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sectionBody}>{job.description}</Text>
          </>
        ) : null}

        {job.mobility && job.mobility.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Mobility & sponsorship</Text>
            <Text style={styles.sectionBody}>{job.mobility.join(" · ")}</Text>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Cover letter (optional)</Text>
        <TextInput
          style={styles.cover}
          multiline
          placeholder="A short note to the hiring team…"
          placeholderTextColor={colors.placeholder}
          value={coverLetter}
          onChangeText={setCoverLetter}
        />

        <View style={styles.actions}>
          <GshGradientPrimaryButton
            title={saveMut.isPending ? "Saving…" : "Save job"}
            onPress={() => saveMut.mutate()}
            disabled={saveMut.isPending}
          />
          <GshGradientPrimaryButton
            title={applyMut.isPending ? "Applying…" : "Apply now"}
            onPress={() => applyMut.mutate()}
            disabled={applyMut.isPending}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  pad: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  err: { color: colors.error, marginBottom: 16, textAlign: "center", fontSize: 15 },
  title: { fontSize: 24, fontWeight: "800", color: colors.textPrimary },
  company: { marginTop: 8, fontSize: 18, fontWeight: "600", color: "#334155" },
  meta: { marginTop: 6, fontSize: 15, color: colors.textMuted },
  sectionTitle: { marginTop: 22, fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  sectionBody: { marginTop: 8, fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  cover: {
    marginTop: 10,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    textAlignVertical: "top",
  },
  actions: { marginTop: 20, gap: 12 },
  secondaryBtn: { marginTop: 12, paddingVertical: 12 },
  secondaryBtnText: { color: colors.brand, fontWeight: "600", fontSize: 16 },
});
