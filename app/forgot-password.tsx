import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { requestForgotPassword } from "@/lib/api-client";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const mut = useMutation({
    mutationFn: () => requestForgotPassword(email.trim().toLowerCase()),
    onSuccess: (data) => {
      Alert.alert("Check your email", data.message || "If an account exists, we sent reset instructions.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (e: unknown) =>
      Alert.alert(
        "Request failed",
        e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Try again."
      ),
  });

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.pad}>
          <Text style={styles.h1}>Forgot password</Text>
          <Text style={styles.lead}>We will email you a link to reset your password.</Text>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
          />
          <Pressable style={[styles.btn, mut.isPending && styles.disabled]} onPress={() => mut.mutate()} disabled={mut.isPending}>
            <Text style={styles.btnText}>{mut.isPending ? "Sending…" : "Send reset link"}</Text>
          </Pressable>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>Back to sign in</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  pad: { padding: 24 },
  h1: { fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 8 },
  lead: { fontSize: 14, color: "#64748b", marginBottom: 20, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 16,
    color: "#0f172a",
  },
  btn: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 17 },
  disabled: { opacity: 0.65 },
  back: { marginTop: 20, alignItems: "center" },
  backText: { color: "#4f46e5", fontWeight: "600", fontSize: 15 },
});
