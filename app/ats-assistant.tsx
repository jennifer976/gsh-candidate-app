import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { atsAnalyze, atsParseProfile } from "@/lib/api-client";
import { colors } from "@/lib/theme";

export default function AtsAssistantScreen() {
  const [cvText, setCvText] = useState("");
  const [profileJson, setProfileJson] = useState<Record<string, unknown> | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [country, setCountry] = useState("");
  const [role, setRole] = useState("");
  const [analysisText, setAnalysisText] = useState<string | null>(null);

  const parseMut = useMutation({
    mutationFn: () => atsParseProfile(cvText.trim()),
    onSuccess: (data) => {
      setProfileJson(data.profile as Record<string, unknown>);
      Alert.alert("CV parsed", "You can run ATS analysis below.");
    },
    onError: (e: unknown) =>
      Alert.alert(
        "Parse failed",
        e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Try again."
      ),
  });

  const analyzeMut = useMutation({
    mutationFn: () => {
      if (!profileJson) throw new Error("Parse your CV first.");
      return atsAnalyze({
        profile: profileJson,
        jobDescription: jobDescription.trim(),
        country: country.trim(),
        role: role.trim(),
      });
    },
    onSuccess: (data) => {
      const a = data.analysis as Record<string, unknown>;
      const score = a.score ?? a.matchScore;
      const summary = typeof a.summary === "string" ? a.summary : JSON.stringify(a, null, 2);
      setAnalysisText(typeof score === "number" ? `Score: ${score}\n\n${summary}` : summary);
    },
    onError: (e: unknown) =>
      Alert.alert(
        "Analysis failed",
        e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Try again."
      ),
  });

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
          <Text style={styles.h1}>ATS assistant</Text>
          <Text style={styles.warn}>
            Educational only — not hiring advice. Paste plain text from your CV (PDF → copy text).
          </Text>

          <Text style={styles.label}>CV text</Text>
          <TextInput
            style={[styles.input, styles.area]}
            multiline
            value={cvText}
            onChangeText={setCvText}
            placeholder="Paste CV text…"
            textAlignVertical="top"
          />
          <GshGradientPrimaryButton title="1. Parse CV" onPress={() => parseMut.mutate()} loading={parseMut.isPending} containerStyle={{ marginTop: 10 }} />

          <Text style={styles.label}>Job description</Text>
          <TextInput
            style={[styles.input, styles.area]}
            multiline
            value={jobDescription}
            onChangeText={setJobDescription}
            placeholder="Paste job description…"
            textAlignVertical="top"
          />
          <Text style={styles.label}>Country (optional)</Text>
          <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="e.g. United Kingdom" />
          <Text style={styles.label}>Role title (optional)</Text>
          <TextInput style={styles.input} value={role} onChangeText={setRole} placeholder="e.g. Software Engineer" />

          <GshGradientPrimaryButton
            title="2. Run ATS-style analysis"
            onPress={() => analyzeMut.mutate()}
            loading={analyzeMut.isPending}
            disabled={!profileJson || analyzeMut.isPending}
            containerStyle={{ marginTop: 10 }}
          />

          {analysisText ? (
            <View style={styles.result}>
              <Text style={styles.resultTitle}>Result</Text>
              <Text style={styles.resultBody}>{analysisText}</Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  pad: { padding: 16, paddingBottom: 48 },
  h1: { fontSize: 22, fontWeight: "800", color: colors.textPrimary, marginBottom: 8 },
  warn: {
    fontSize: 12,
    color: colors.warningText,
    backgroundColor: colors.warningBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    lineHeight: 18,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  area: { minHeight: 120 },
  result: {
    marginTop: 20,
    padding: 14,
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultTitle: { fontSize: 16, fontWeight: "800", color: colors.textPrimary, marginBottom: 8 },
  resultBody: { fontSize: 14, color: "#334155", lineHeight: 22 },
});
