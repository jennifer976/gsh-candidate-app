import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { submitFeedback } from "@/lib/api-client";
import { colors, fontFamily, radii } from "@/lib/theme";

const TYPES = ["feature", "issue", "update", "request"] as const;
const PRIOS = ["low", "medium", "high"] as const;

export default function FeedbackScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("feature");
  const [priority, setPriority] = useState<(typeof PRIOS)[number]>("medium");

  const mut = useMutation({
    mutationFn: () =>
      submitFeedback({
        title: title.trim(),
        description: description.trim(),
        type,
        priority,
      }),
    onSuccess: () => {
      Alert.alert("Thank you", "Your feedback was submitted.", [{ text: "OK", onPress: () => router.back() }]);
    },
    onError: (e: unknown) =>
      Alert.alert(
        "Could not send",
        e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Try again."
      ),
  });

  function send() {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing info", "Please add a title and description.");
      return;
    }
    mut.mutate();
  }

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.eyebrow}>Global Sponsor Hub</Text>
            <Text style={styles.h1}>Feedback</Text>
            <Text style={styles.lead}>Tell us what to improve — bugs, ideas, or UX friction.</Text>

            <Text style={styles.label}>Type</Text>
            <View style={styles.row}>
              {TYPES.map((t) => (
                <Pressable
                  key={t}
                  style={[styles.chip, type === t && styles.chipOn]}
                  onPress={() => setType(t)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: type === t }}
                >
                  <Text style={[styles.chipText, type === t && styles.chipTextOn]}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.row}>
              {PRIOS.map((p) => (
                <Pressable
                  key={p}
                  style={[styles.chip, priority === p && styles.chipOn]}
                  onPress={() => setPriority(p)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: priority === p }}
                >
                  <Text style={[styles.chipText, priority === p && styles.chipTextOn]}>{p}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.groupLabel, styles.groupSpaced]}>Details</Text>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Short summary"
              placeholderTextColor={colors.placeholder}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.area]}
              value={description}
              onChangeText={setDescription}
              placeholder="What happened? What did you expect?"
              placeholderTextColor={colors.placeholder}
              multiline
              textAlignVertical="top"
            />

            <GshGradientPrimaryButton
              title={mut.isPending ? "Sending…" : "Submit"}
              onPress={send}
              disabled={mut.isPending}
              containerStyle={{ marginTop: 20 }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 16, paddingBottom: 40 },
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
    marginBottom: 8,
  },
  lead: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 18,
    lineHeight: 22,
  },
  groupLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.75,
    marginBottom: 8,
    marginTop: 4,
  },
  groupSpaced: { marginTop: 18 },
  label: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.chipOnBg, borderColor: colors.chipOnBorder },
  chipText: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
    textTransform: "capitalize",
  },
  chipTextOn: { color: colors.white },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  area: { minHeight: 140, marginBottom: 4 },
});
