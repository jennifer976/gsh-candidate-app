import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
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
import { loginRequest } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { colors, fontFamily } from "@/lib/theme";

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
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brandRow}>
              <Image source={require("../assets/brand-mark.png")} style={styles.mark} resizeMode="contain" accessibilityIgnoresInvertColors />
              <View>
                <Text style={styles.title}>Global Sponsor Hub</Text>
                <Text style={styles.subtitle}>Candidate sign in</Text>
              </View>
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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 28 },
  mark: { width: 52, height: 52 },
  title: { fontSize: 22, fontFamily: fontFamily.bold, color: colors.textPrimary, letterSpacing: -0.3 },
  subtitle: { marginTop: 4, fontSize: 15, fontFamily: fontFamily.medium, color: colors.textMuted },
  label: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textSecondary, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.92)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    fontSize: 16,
    backgroundColor: colors.background,
    marginBottom: 16,
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
  },
  linkWrap: { marginTop: 24, alignItems: "center" },
  linkWrapTight: { marginTop: 14 },
  link: { color: colors.brand, fontSize: 15, fontFamily: fontFamily.semiBold },
  linkMuted: { color: colors.textMuted, fontSize: 15, fontFamily: fontFamily.medium },
});
