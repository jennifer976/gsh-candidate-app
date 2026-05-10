import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { loginRequest } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { colors } from "@/lib/theme";

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
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.placeholder}
          value={password}
          onChangeText={setPassword}
        />

        <GshGradientPrimaryButton title="Sign in" onPress={onSubmit} loading={loading} containerStyle={{ marginTop: 8 }} />

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
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  flex: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  header: { marginBottom: 28 },
  title: { fontSize: 26, fontWeight: "700", color: colors.textPrimary },
  subtitle: { marginTop: 6, fontSize: 16, color: colors.textMuted, fontWeight: "500" },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    backgroundColor: colors.background,
    marginBottom: 16,
    color: colors.textPrimary,
  },
  linkWrap: { marginTop: 24, alignItems: "center" },
  linkWrapTight: { marginTop: 14 },
  link: { color: colors.brand, fontSize: 15, fontWeight: "500" },
  linkMuted: { color: colors.textMuted, fontSize: 15, fontWeight: "500" },
});
