import { GshPressable } from "@/components/GshPressable";
import { analyzeCvQuality, type CvQualitySeverity } from "@/lib/cv-quality";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { colors, fontFamily, navHeader, radii } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SEVERITY: Record<
  CvQualitySeverity,
  { icon: "checkmark-circle" | "alert-circle" | "remove-circle"; color: string }
> = {
  pass: { icon: "checkmark-circle", color: "#15803d" },
  warn: { icon: "remove-circle", color: "#a16207" },
  fail: { icon: "alert-circle", color: colors.error },
};

export default function CvQualityCheckerScreen() {
  const ac = useAccountCopy();
  const [rawText, setRawText] = useState("");
  const [busy, setBusy] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const result = useMemo(
    () => (analyzed && rawText.trim() ? analyzeCvQuality(rawText) : null),
    [analyzed, rawText],
  );

  const chooseTextFile = async () => {
    setBusy(true);
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ["text/plain"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (picked.canceled) return;
      const asset = picked.assets[0];
      const response = await fetch(asset.uri);
      const text = await response.text();
      if (!text.trim()) throw new Error("empty");
      setRawText(text);
      setAnalyzed(true);
    } catch {
      Alert.alert(
        ac("Could not read that file"),
        ac("Paste the CV text below instead."),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Stack.Screen options={{ title: ac("CV quality check"), ...navHeader }} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="document-text-outline" size={24} color={colors.navy} />
          </View>
          <Text style={styles.title}>{ac("Make your CV easier to review")}</Text>
          <Text style={styles.lead}>
            {ac(
              "Run private, on-device checks for structure, contact details, dates, and measurable achievements.",
            )}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fileRow}>
            <GshPressable
              style={styles.fileButton}
              onPress={chooseTextFile}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color={colors.navy} />
              ) : (
                <Ionicons name="document-attach-outline" size={19} color={colors.navy} />
              )}
              <Text style={styles.fileButtonText}>{ac("Load a text file")}</Text>
            </GshPressable>
            <Text style={styles.fileHint}>{ac("TXT files")}</Text>
          </View>

          <Text style={styles.label}>{ac("Or paste your CV text")}</Text>
          <TextInput
            value={rawText}
            onChangeText={(value) => {
              setRawText(value);
              setAnalyzed(false);
            }}
            multiline
            numberOfLines={14}
            textAlignVertical="top"
            placeholder={ac("Paste the text from your CV here…")}
            placeholderTextColor={colors.placeholder}
            style={styles.textArea}
          />

          <View style={styles.actions}>
            <GshPressable
              style={[
                styles.analyzeButton,
                !rawText.trim() && styles.disabled,
              ]}
              onPress={() => setAnalyzed(true)}
              disabled={!rawText.trim()}
            >
              <Text style={styles.analyzeText}>{ac("Analyze CV")}</Text>
            </GshPressable>
            <GshPressable
              style={styles.clearButton}
              onPress={() => {
                setRawText("");
                setAnalyzed(false);
              }}
            >
              <Text style={styles.clearText}>{ac("Clear")}</Text>
            </GshPressable>
          </View>
        </View>

        {result ? (
          <View style={styles.resultCard}>
            <View style={styles.scoreRow}>
              <View>
                <Text style={styles.scoreLabel}>{ac("CV quality score")}</Text>
                <Text style={styles.score}>{result.score}</Text>
                <Text style={styles.wordCount}>
                  {ac("{count} words", { count: result.wordCount })}
                </Text>
              </View>
              <View style={styles.scoreRing}>
                <Text style={styles.scoreRingText}>{result.score}%</Text>
              </View>
            </View>

            <View style={styles.checks}>
              {result.checks.map((check) => {
                const severity = SEVERITY[check.severity];
                return (
                  <View key={check.id} style={styles.check}>
                    <Ionicons
                      name={severity.icon}
                      size={20}
                      color={severity.color}
                    />
                    <Text style={styles.checkText}>{ac(check.message)}</Text>
                  </View>
                );
              })}
            </View>

            <Text style={styles.disclaimer}>
              {ac(
                "This is a pattern-based writing check, not an ATS guarantee, hiring decision, or immigration assessment.",
              )}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.pale },
  content: { padding: 16, paddingBottom: 48, gap: 14 },
  hero: {
    padding: 20,
    borderRadius: radii.xl,
    backgroundColor: colors.navy,
    gap: 9,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cyan,
  },
  title: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 24,
    lineHeight: 29,
    color: colors.white,
  },
  lead: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.76)",
  },
  card: {
    padding: 16,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    gap: 12,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fileButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.pale,
  },
  fileButtonText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  fileHint: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  textArea: {
    minHeight: 260,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.navy,
  },
  actions: { flexDirection: "row", gap: 10 },
  analyzeButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: colors.navy,
  },
  analyzeText: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.white,
  },
  clearButton: {
    minWidth: 90,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  disabled: { opacity: 0.5 },
  resultCard: {
    padding: 18,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scoreLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: colors.textMuted,
  },
  score: {
    marginTop: 3,
    fontFamily: fontFamily.headingStrong,
    fontSize: 38,
    color: colors.navy,
  },
  wordCount: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  scoreRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 7,
    borderColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreRingText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.navy,
  },
  checks: { marginTop: 18, gap: 11 },
  check: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  disclaimer: {
    marginTop: 18,
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textMuted,
  },
});
