import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { atsAnalyze, atsParseProfile } from "@/lib/api-client";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

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
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.eyebrow}>Career toolkit</Text>
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
              placeholderTextColor={colors.placeholder}
              textAlignVertical="top"
            />
            <GshGradientPrimaryButton
              title="1. Parse CV"
              onPress={() => parseMut.mutate()}
              loading={parseMut.isPending}
              containerStyle={{ marginTop: 10 }}
            />

            <Text style={styles.label}>Job description</Text>
            <TextInput
              style={[styles.input, styles.area]}
              multiline
              value={jobDescription}
              onChangeText={setJobDescription}
              placeholder="Paste job description…"
              placeholderTextColor={colors.placeholder}
              textAlignVertical="top"
            />
            <Text style={styles.label}>Country (optional)</Text>
            <TextInput
              style={styles.input}
              value={country}
              onChangeText={setCountry}
              placeholder="e.g. United Kingdom"
              placeholderTextColor={colors.placeholder}
            />
            <Text style={styles.label}>Role title (optional)</Text>
            <TextInput
              style={styles.input}
              value={role}
              onChangeText={setRole}
              placeholder="e.g. Software Engineer"
              placeholderTextColor={colors.placeholder}
            />

            <GshGradientPrimaryButton
              title="2. Run ATS-style analysis"
              onPress={() => analyzeMut.mutate()}
              loading={analyzeMut.isPending}
              disabled={!profileJson || analyzeMut.isPending}
              containerStyle={{ marginTop: 10 }}
            />

            {analysisText ? (
              <View style={[cardSurfaceStyle(false), styles.result]}>
                <Text style={styles.resultTitle}>Result</Text>
                <Text style={styles.resultBody}>{analysisText}</Text>
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 16, paddingBottom: 48 },
  eyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  h1: {
    fontFamily: fontFamily.extraBold,
    fontSize: 26,
    letterSpacing: -0.35,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  warn: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.warningText,
    backgroundColor: colors.warningBg,
    padding: 14,
    borderRadius: radii.sm,
    marginBottom: 16,
    lineHeight: 19,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  label: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: 14,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  area: { minHeight: 120 },
  result: {
    marginTop: 22,
    padding: 16,
    backgroundColor: colors.background,
    borderLeftWidth: 4,
    borderLeftColor: colors.brand,
  },
  resultTitle: {
    fontSize: 16,
    fontFamily: fontFamily.extraBold,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  resultBody: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMarketing, lineHeight: 22 },
});
