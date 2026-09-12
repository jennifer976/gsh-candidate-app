import { AppLanguageSetting } from "@/components/AppLanguageSetting";
import { useAuthCopy } from "@/lib/i18n/useAuthCopy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { LegalConsentRegisterNote } from "@/components/LegalConsentLinks";
import { brandLockupLight } from "@/lib/brand-assets";
import { registerCandidate } from "@/lib/api-client";
import { persistCandidateReturnIntent } from "@/lib/candidate-return-intent";
import { colors, fontFamily, radii } from "@/lib/theme";

export default function RegisterScreen() {
  const ac = useAuthCopy();
  const [feedback, setFeedback] = useState<Parameters<typeof ac>[0] | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const returnTo = Array.isArray(params.returnTo)
      ? params.returnTo[0]
      : params.returnTo;
    if (returnTo) void persistCandidateReturnIntent(returnTo);
  }, [params.returnTo]);

  async function onSubmit() {
    if (loading) return;
    setFeedback(null);
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || !password || password.length < 8) {
      setFeedback('Use a valid email and a password of at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const data = await registerCandidate(e, password);
      router.replace({
        pathname: "/verify",
        params: {
          userId: data.userId,
          ...(typeof params.returnTo === "string"
            ? { returnTo: params.returnTo }
            : {}),
        },
      });
    } catch (err: unknown) {
      setFeedback("We could not create your account. Try again or contact support.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
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
            <Animated.View
              entering={FadeInDown.delay(100).duration(600).springify()}
              style={styles.brandBlock}
            >
              <Image
                source={brandLockupLight}
                style={styles.logo}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
                accessibilityLabel="Global Sponsor Hub"
              />
              <Text style={styles.brandTagline}>
                {ac("Free for candidates.")}
              </Text>
            </Animated.View>

            <AppLanguageSetting />
            <Animated.View
              entering={FadeInUp.delay(300).duration(600).springify()}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>{ac("Create your account")}</Text>
              <Text style={styles.cardSubtitle}>
                {ac(
                  "Explore jobs, save useful resources and choose who can contact you.",
                )}
              </Text>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>{ac("Email")}</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="you@example.com"
                    placeholderTextColor={colors.placeholder}
                    accessibilityLabel={ac("Email")}
                    editable={!loading}
                    value={email}
                    onChangeText={setEmail}
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>{ac("Password")}</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    placeholder={ac("At least 8 characters")}
                    placeholderTextColor={colors.placeholder}
                    accessibilityLabel={ac("Password")}
                    editable={!loading}
                    value={password}
                    onChangeText={setPassword}
                    returnKeyType="done"
                    onSubmitEditing={onSubmit}
                  />
                </View>
              </View>

              {feedback && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ color: "#9f1239", backgroundColor: "#fff1f2", borderRadius: 12, padding: 12, marginBottom: 12, fontFamily: fontFamily.regular, lineHeight: 22 }}>{ac(feedback)}</Text>}
              <GshGradientPrimaryButton
                title={ac("Create account")}
                onPress={onSubmit}
                loading={loading}
                containerStyle={{ marginTop: 8 }}
              />
            </Animated.View>

            <Animated.View
              entering={FadeIn.delay(600).duration(500)}
              style={styles.footerLinks}
            >
              <LegalConsentRegisterNote />
              <Pressable
                onPress={() =>
                  router.replace({
                    pathname: "/login",
                    params:
                      typeof params.returnTo === "string"
                        ? { returnTo: params.returnTo }
                        : undefined,
                  })
                }
                accessibilityRole="button"
              >
                <Text style={styles.footerLink}>
                  {ac("Already have an account?")}{" "}
                  <Text style={styles.footerLinkAccent}>{ac("Sign in")}</Text>
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
  root: { flex: 1, backgroundColor: colors.white },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 24,
  },
  brandBlock: {
    alignItems: "center",
    gap: 12,
    marginHorizontal: -24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: colors.navy,
  },
  logo: { width: 280, height: 64, alignSelf: "center" },
  brandTagline: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textOnDarkMuted,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: colors.white,
    paddingVertical: 8,
    gap: 4,
  },
  cardTitle: {
    fontFamily: fontFamily.heading,
    fontSize: 24,
    color: colors.navy,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: 20,
  },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputWrap: {
    minHeight: 52,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 11,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
  },
  footerLinks: { alignItems: "center", gap: 16 },
  footerLink: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  footerLinkAccent: {
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
  },
});
