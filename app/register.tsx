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
import { LegalConsentRegisterNote } from "@/components/LegalConsentLinks";
import { brandLogo, brandMark } from "@/lib/brand-assets";
import { registerCandidate } from "@/lib/api-client";
import { colors, fontFamily, radii } from "@/lib/theme";

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
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Signup failed";
      const devHint =
        "Developer hint: set EXPO_PUBLIC_GSH_MOBILE_REGISTRATION_KEY in .env to match the API MOBILE_APP_REGISTRATION_KEY.";
      const userHint =
        "Verification failed for this app version. Try again or contact support.";
      const secHint = /security verification/i.test(msg) ? (__DEV__ ? `${userHint}\n\n${devHint}` : userHint) : "";
      Alert.alert("Could not register", secHint || msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#040c24", "#080f2e", "#0f1a4a"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />
      <View style={styles.glowTopRight} pointerEvents="none" />
      <View style={styles.glowBottomLeft} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={styles.brandBlock}>
              <Image source={brandMark} style={styles.mark} resizeMode="contain" accessibilityIgnoresInvertColors />
              <Image source={brandLogo} style={styles.logo} resizeMode="contain" accessibilityIgnoresInvertColors />
              <Text style={styles.brandTagline}>Free to join. No recruiter middlemen.</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300).duration(600).springify()} style={styles.card}>
              <Text style={styles.cardTitle}>Create your account</Text>
              <Text style={styles.cardSubtitle}>
                See visa sponsorship and relocation support before you apply — on every listing, upfront.
              </Text>

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
                    style={styles.input}
                    secureTextEntry
                    placeholder="At least 8 characters"
                    placeholderTextColor={colors.textOnDarkDim}
                    value={password}
                    onChangeText={setPassword}
                    returnKeyType="done"
                    onSubmitEditing={onSubmit}
                  />
                </View>
              </View>

              <GshGradientPrimaryButton
                title="Create account"
                onPress={onSubmit}
                loading={loading}
                containerStyle={{ marginTop: 8 }}
              />
            </Animated.View>

            <Animated.View entering={FadeIn.delay(600).duration(500)} style={styles.footerLinks}>
              <LegalConsentRegisterNote />
              <Pressable onPress={() => router.replace("/login")} accessibilityRole="button">
                <Text style={styles.footerLink}>
                  Already have an account?{" "}
                  <Text style={styles.footerLinkAccent}>Sign in</Text>
                </Text>
              </Pressable>
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
  glowTopRight: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(14,205,209,0.1)",
  },
  glowBottomLeft: {
    position: "absolute",
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(97,10,144,0.18)",
  },
  brandBlock: { alignItems: "center", gap: 12, paddingBottom: 8 },
  mark: { width: 60, height: 60, borderRadius: 16 },
  logo: { width: 200, height: 48 },
  brandTagline: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textOnDarkMuted,
    letterSpacing: 0.2,
  },
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
    lineHeight: 21,
    marginBottom: 20,
  },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  },
  inputWrap: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderOnDark,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 11,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.white,
  },
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
