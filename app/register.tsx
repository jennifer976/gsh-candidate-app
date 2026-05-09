import { useRouter } from "expo-router";
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
import { registerCandidate } from "@/lib/api-client";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const e = email.trim().toLowerCase();
    if (!e || !password || password.length < 8) {
      Alert.alert("Check your details", "Use a valid email and a password of at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const data = await registerCandidate(e, password);
      Alert.alert("Check your email", data.message || "We sent a verification code.");
      router.replace({ pathname: "/verify", params: { userId: data.userId } });
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Signup failed";
      Alert.alert("Could not register", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <Text style={styles.lead}>Create a free candidate account to save jobs and apply.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="At least 8 characters"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
        />

        <Pressable style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Continue</Text>}
        </Pressable>

        <Pressable style={styles.linkWrap} onPress={() => router.back()}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
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
    fontSize: 16,
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
  linkWrap: { marginTop: 24, alignItems: "center" },
  link: { color: "#4f46e5", fontSize: 15, fontWeight: "500" },
});
