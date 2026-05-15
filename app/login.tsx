import { LinearGradient } from "expo-linear-gradient";
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
import { LegalConsentFooterRow } from "@/components/LegalConsentLinks";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { brandMark } from "@/lib/brand-assets";
import { loginRequest } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

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
          "This app is for candidates only. Employer and partner access uses a separate product — contact support if you need the right sign-in."
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
              <Image source={brandMark} style={styles.mark} resizeMode="contain" accessibilityIgnoresInvertColors />
              <View style={styles.brandText}>
                <GshScreenIntro eyebrow="Global Sponsor Hub" title="Sign in" subtitle="Candidate access to saved jobs, applications, and messages." />
              </View>
            </View>

            <LinearGradient colors={[colors.teal, colors.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accentBar} />

            <View style={[cardSurfaceStyle(false), styles.formCard]}>
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
            </View>

            <Pressable style={[styles.linkWrap, styles.linkWrapTight]} onPress={() => router.push("/forgot-password")}>
              <Text style={styles.linkMuted}>Forgot password?</Text>
            </Pressable>

            <Pressable style={styles.linkWrap} onPress={() => router.push("/register")}>
              <Text style={styles.link}>New here? Create a candidate account</Text>
            </Pressable>

            <LegalConsentFooterRow />
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
  brandRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  mark: { width: 44, height: 44 },
  brandText: { flex: 1 },
  accentBar: { height: 4, borderRadius: 2, marginBottom: 18 },
  formCard: {
    padding: 20,
    borderRadius: radii.lg,
    backgroundColor: colors.background,
    marginBottom: 8,
  },
  label: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textSecondary, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.92)",
    borderRadius: radii.md,
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
