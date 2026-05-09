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
import { submitFeedback } from "@/lib/api-client";

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

          <Pressable style={[styles.primaryBtn, mut.isPending && styles.disabled]} onPress={send} disabled={mut.isPending}>
            <Text style={styles.primaryBtnText}>{mut.isPending ? "Sending…" : "Submit"}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  pad: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 22, fontWeight: "800", color: "#0f172a", marginBottom: 8 },
  lead: { fontSize: 14, color: "#64748b", marginBottom: 16, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 8, marginTop: 12 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chipOn: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#475569", textTransform: "capitalize" },
  chipTextOn: { color: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#0f172a",
  },
  area: { minHeight: 140 },
  primaryBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 17 },
  disabled: { opacity: 0.65 },
});
