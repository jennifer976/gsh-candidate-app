import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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
import { verifyOtpRequest } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

export default function VerifyScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const uid = String(userId || "").trim();
    const c = code.trim();
    if (!uid || !c) {
      Alert.alert("Missing code", "Enter the verification code from your email.");
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOtpRequest(uid, c);
      setAuth(data.token, data.user);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Verification failed";
      Alert.alert("Could not verify", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <Text style={styles.lead}>Enter the code we emailed you to activate your account.</Text>

        <Text style={styles.label}>Verification code</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="characters"
          placeholder="123456"
          placeholderTextColor="#94a3b8"
          value={code}
          onChangeText={setCode}
        />

        <Pressable style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Verify & continue</Text>}
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  flex: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  lead: { fontSize: 15, color: "#475569", marginBottom: 20, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 18,
    letterSpacing: 2,
    backgroundColor: "#fff",
    marginBottom: 16,
    color: "#0f172a",
  },
  primaryBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: "#fff", fontSize: 17, fontWeight: "600" },
});
