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
import { submitFeedback } from "@/lib/api-client";
import { colors } from "@/lib/theme";

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
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
          <Text style={styles.h1}>Feedback</Text>
          <Text style={styles.lead}>Tell us what to improve — bugs, ideas, or UX friction.</Text>

          <Text style={styles.label}>Type</Text>
          <View style={styles.row}>
            {TYPES.map((t) => (
              <Pressable key={t} style={[styles.chip, type === t && styles.chipOn]} onPress={() => setType(t)}>
                <Text style={[styles.chipText, type === t && styles.chipTextOn]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Priority</Text>
          <View style={styles.row}>
            {PRIOS.map((p) => (
              <Pressable key={p} style={[styles.chip, priority === p && styles.chipOn]} onPress={() => setPriority(p)}>
                <Text style={[styles.chipText, priority === p && styles.chipTextOn]}>{p}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Short summary" />

          <Text style={styles.label}>Details</Text>
          <TextInput
            style={[styles.input, styles.area]}
            value={description}
            onChangeText={setDescription}
            placeholder="What happened? What did you expect?"
            multiline
            textAlignVertical="top"
          />

          <GshGradientPrimaryButton title={mut.isPending ? "Sending…" : "Submit"} onPress={send} disabled={mut.isPending} containerStyle={{ marginTop: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  pad: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 22, fontWeight: "800", color: colors.textPrimary, marginBottom: 8 },
  lead: { fontSize: 14, color: colors.textMuted, marginBottom: 16, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 8, marginTop: 12 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.chipOnBg, borderColor: colors.chipOnBorder },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, textTransform: "capitalize" },
  chipTextOn: { color: colors.white },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  area: { minHeight: 140 },
});
