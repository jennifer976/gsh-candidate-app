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
import { loginRequest } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const e = email.trim().toLowerCase();
    if (!e || !password) {
      Alert.alert("Missing fields", "Enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const data = await loginRequest(e, password);
      const ut = String(data.user?.userType ?? "").toLowerCase();
      if (ut && ut !== "candidate") {
        Alert.alert(
          "Employer or partner account",
          "This app is for candidates. Please use the Global Sponsor Hub website for employer or partner tools."
        );
        return;
      }
      setAuth(data.token, data.user);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Login failed";
      Alert.alert("Sign in failed", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.header}>
          <Text style={styles.title}>Global Sponsor Hub</Text>
          <Text style={styles.subtitle}>Candidate</Text>
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
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
          placeholder="••••••••"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
        />

        <Pressable style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Sign in</Text>}
        </Pressable>

        <Pressable style={[styles.linkWrap, styles.linkWrapTight]} onPress={() => router.push("/forgot-password")}>
          <Text style={styles.linkMuted}>Forgot password?</Text>
        </Pressable>

        <Pressable style={styles.linkWrap} onPress={() => router.push("/register")}>
          <Text style={styles.link}>New here? Create a candidate account</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  flex: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  header: { marginBottom: 28 },
  title: { fontSize: 26, fontWeight: "700", color: "#0f172a" },
  subtitle: { marginTop: 6, fontSize: 16, color: "#64748b", fontWeight: "500" },
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
  linkWrapTight: { marginTop: 14 },
  link: { color: "#4f46e5", fontSize: 15, fontWeight: "500" },
  linkMuted: { color: "#64748b", fontSize: 15, fontWeight: "500" },
});
