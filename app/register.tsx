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
import { registerCandidate } from "@/lib/api-client";
import { colors, fontFamily } from "@/lib/theme";

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
      const securityHint =
        /security verification/i.test(msg) &&
        "The API expects a mobile signup key in this app build (not a visible checkbox). For local runs, set EXPO_PUBLIC_GSH_MOBILE_REGISTRATION_KEY in .env to match the API’s MOBILE_APP_REGISTRATION_KEY. For EAS builds, add the same name as an EAS secret and rebuild.";
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
              <Text style={styles.headline}>Join as a candidate</Text>
            </View>

            <Text style={styles.lead}>Create a free account to save jobs and apply in one place.</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
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

            <Pressable style={styles.linkWrap} onPress={() => router.back()}>
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
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  mark: { width: 40, height: 40 },
  headline: { flex: 1, fontSize: 22, fontFamily: fontFamily.bold, color: colors.textPrimary, letterSpacing: -0.3 },
  lead: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    marginBottom: 22,
    lineHeight: 22,
  },
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
  link: { color: colors.brand, fontSize: 15, fontFamily: fontFamily.semiBold },
});
