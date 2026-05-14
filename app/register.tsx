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
import { LegalConsentRegisterNote } from "@/components/LegalConsentLinks";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { registerCandidate } from "@/lib/api-client";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

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
      router.replace({ pathname: "/verify", params: { userId: data.userId } });
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Signup failed";
      const devVerificationHint =
        "Developer hint: set EXPO_PUBLIC_GSH_MOBILE_REGISTRATION_KEY in .env (local) or EAS secrets (production builds) to match the API MOBILE_APP_REGISTRATION_KEY.";
      const userVerificationHint =
        "Signup verification failed for this app version. Please try again later or contact support if it keeps happening.";
      const securityHint = /security verification/i.test(msg)
        ? __DEV__
          ? `${userVerificationHint}\n\n${devVerificationHint}`
          : userVerificationHint
        : "";
      Alert.alert("Could not register", securityHint || msg);
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
              <Image source={require("../assets/brand-mark.webp")} style={styles.mark} resizeMode="contain" accessibilityIgnoresInvertColors />
            </View>

            <GshScreenIntro
              eyebrow="Global Sponsor Hub"
              title="Join as a candidate"
              subtitle="Create a free account to save jobs and apply in one place."
              style={{ marginBottom: 16 }}
            />
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
                placeholder="At least 8 characters"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={setPassword}
              />

              <GshGradientPrimaryButton title="Continue" onPress={onSubmit} loading={loading} containerStyle={{ marginTop: 8 }} />
            </View>

            <LegalConsentRegisterNote />

            <Pressable style={styles.linkWrap} onPress={() => router.replace("/login")}>
              <Text style={styles.link}>Already have an account? Sign in</Text>
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
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  mark: { width: 44, height: 44 },
  accentBar: { height: 4, borderRadius: 2, marginBottom: 18 },
  label: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textSecondary, marginBottom: 8 },
  formCard: {
    padding: 20,
    borderRadius: radii.lg,
    backgroundColor: colors.background,
    marginBottom: 8,
  },
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
  link: { color: colors.brand, fontSize: 15, fontFamily: fontFamily.semiBold },
});
