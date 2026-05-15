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
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { LegalConsentFooterRow } from "@/components/LegalConsentLinks";
import { brandLogo, brandMark } from "@/lib/brand-assets";
import { loginRequest } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { colors, fontFamily, radii } from "@/lib/theme";

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

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
          "This app is for candidates only. Employer and partner access uses a separate product."
        );
        return;
      }
      setAuth(data.token, data.user);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Login failed";
      Alert.alert("Sign in failed", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      {/* Deep navy gradient background */}
      <LinearGradient
        colors={["#040c24", "#080f2e", "#0f1a4a"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      {/* Teal glow top-right */}
      <View style={styles.glowTopRight} pointerEvents="none" />
      {/* Purple glow bottom-left */}
      <View style={styles.glowBottomLeft} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Brand */}
            <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={styles.brandBlock}>
              <Image
                source={brandMark}
                style={styles.mark}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
              <Image
                source={brandLogo}
                style={styles.logo}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
              <Text style={styles.brandTagline}>Visa sponsorship & relocation — labelled before you apply.</Text>
            </Animated.View>

            {/* Form card */}
            <Animated.View entering={FadeInUp.delay(300).duration(600).springify()} style={styles.card}>
              <Text style={styles.cardTitle}>Sign in</Text>
              <Text style={styles.cardSubtitle}>Find roles that actually sponsor. Apply and track everything in one place.</Text>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Email</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="you@example.com"
                    placeholderTextColor={colors.textOnDarkDim}
                    value={email}
                    onChangeText={setEmail}
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Password</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={[styles.input, styles.inputWithBtn]}
                    secureTextEntry={!passwordVisible}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textOnDarkDim}
                    value={password}
                    onChangeText={setPassword}
                    returnKeyType="done"
                    onSubmitEditing={onSubmit}
                  />
                  <Pressable
                    onPress={() => setPasswordVisible((v) => !v)}
                    style={styles.eyeBtn}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
                  >
                    <Text style={styles.eyeIcon}>{passwordVisible ? "🙈" : "👁"}</Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={() => router.push("/forgot-password")}
                style={styles.forgotWrap}
                accessibilityRole="button"
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              <GshGradientPrimaryButton
                title="Sign in"
                onPress={onSubmit}
                loading={loading}
                containerStyle={{ marginTop: 8 }}
              />
            </Animated.View>

            {/* Footer links */}
            <Animated.View entering={FadeIn.delay(600).duration(500)} style={styles.footerLinks}>
              <Pressable onPress={() => router.push("/register")} accessibilityRole="button">
                <Text style={styles.footerLink}>
                  New here?{" "}
                  <Text style={styles.footerLinkAccent}>Create a candidate account</Text>
                </Text>
              </Pressable>
              <LegalConsentFooterRow />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navyDeep },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 24,
  },

  // Ambient glows
  glowTopRight: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(14,205,209,0.12)",
  },
  glowBottomLeft: {
    position: "absolute",
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(97,10,144,0.2)",
  },

  // Brand block
  brandBlock: {
    alignItems: "center",
    gap: 12,
    paddingBottom: 8,
  },
  mark: { width: 64, height: 64, borderRadius: 18 },
  logo: { width: 200, height: 48 },
  brandTagline: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textOnDarkMuted,
    letterSpacing: 0.2,
  },

  // Card
  card: {
    backgroundColor: "rgba(17,29,94,0.85)",
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.borderOnDark,
    padding: 24,
    gap: 4,
  },
  cardTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 24,
    color: colors.white,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textOnDarkMuted,
    lineHeight: 20,
    marginBottom: 20,
  },

  // Fields
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderOnDark,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 11,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.white,
  },
  inputWithBtn: { paddingRight: 4 },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 12 },
  eyeIcon: { fontSize: 16 },

  // Forgot
  forgotWrap: { alignSelf: "flex-end", paddingVertical: 4, marginBottom: 4 },
  forgotText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.teal,
  },

  // Footer
  footerLinks: { alignItems: "center", gap: 16 },
  footerLink: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textOnDarkMuted,
    textAlign: "center",
  },
  footerLinkAccent: {
    fontFamily: fontFamily.semiBold,
    color: colors.teal,
  },
});
