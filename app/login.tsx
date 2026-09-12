import { AppLanguageSetting } from "@/components/AppLanguageSetting";
import { useAuthCopy } from "@/lib/i18n/useAuthCopy";
import { Ionicons } from "@expo/vector-icons";
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
import { LegalConsentFooterRow } from "@/components/LegalConsentLinks";
import { brandLockupLight } from "@/lib/brand-assets";
import { loginRequest } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import {
  parsePendingCandidateAction,
  persistCandidateReturnIntent,
} from "@/lib/candidate-return-intent";
import { colors, fontFamily, radii } from "@/lib/theme";

export default function LoginScreen() {
  const ac = useAuthCopy();
  const [feedback, setFeedback] = useState<Parameters<typeof ac>[0] | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams<{
    returnTo?: string | string[];
    pendingAction?: string | string[];
    pendingTargetId?: string | string[];
  }>();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    const first = (value: string | string[] | undefined) =>
      Array.isArray(value) ? value[0] : value;
    const returnTo = first(params.returnTo);
    if (!returnTo) return;
    void persistCandidateReturnIntent(
      returnTo,
      parsePendingCandidateAction(
        first(params.pendingAction),
        first(params.pendingTargetId),
      ),
    );
  }, [params.pendingAction, params.pendingTargetId, params.returnTo]);

  async function onSubmit() {
    if (loading) return;
    setFeedback(null);
    const e = email.trim().toLowerCase();
    if (!e || !password) {
      setFeedback('Enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await loginRequest(e, password);
      const ut = String(data.user?.userType ?? "").toLowerCase();
      if (ut && ut !== "candidate") {
        setFeedback('This app is for candidates. Sign in on the website for employer, agency or specialist access.');
        return;
      }
      setAuth(data.token, data.user);
      router.replace("/(tabs)/home");
    } catch (err: unknown) {
      setFeedback("We could not sign you in. Check your details and try again.");
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
                {ac("Find international jobs. Plan your next move.")}
              </Text>
            </Animated.View>

            <AppLanguageSetting />
            <Animated.View
              entering={FadeInUp.delay(300).duration(600).springify()}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>{ac("Sign in")}</Text>
              <Text style={styles.cardSubtitle}>
                {ac("Save jobs, manage applications and plan your move.")}
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
                    style={[styles.input, styles.inputWithBtn]}
                    secureTextEntry={!passwordVisible}
                    placeholder="••••••••"
                    placeholderTextColor={colors.placeholder}
                    accessibilityLabel={ac("Password")}
                    editable={!loading}
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
                    accessibilityLabel={
                      passwordVisible
                        ? ac("Hide password")
                        : ac("Show password")
                    }
                  >
                    <Ionicons
                      name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                      size={21}
                      color={colors.textMuted}
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={() => router.push("/forgot-password")}
                style={styles.forgotWrap}
                accessibilityRole="button"
              >
                <Text style={styles.forgotText}>{ac("Forgot password?")}</Text>
              </Pressable>

              {feedback && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ color: "#9f1239", backgroundColor: "#fff1f2", borderRadius: 12, padding: 12, marginBottom: 12, fontFamily: fontFamily.regular, lineHeight: 22 }}>{ac(feedback)}</Text>}
              <GshGradientPrimaryButton
                title={ac("Sign in")}
                onPress={onSubmit}
                loading={loading}
                containerStyle={{ marginTop: 8 }}
              />
            </Animated.View>

            <Animated.View
              entering={FadeIn.delay(600).duration(500)}
              style={styles.footerLinks}
            >
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/register",
                    params:
                      typeof params.returnTo === "string"
                        ? { returnTo: params.returnTo }
                        : undefined,
                  })
                }
                accessibilityRole="button"
              >
                <Text style={styles.footerLink}>
                  {ac("New here?")}{" "}
                  <Text style={styles.footerLinkAccent}>
                    {ac("Create a candidate account")}
                  </Text>
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
    lineHeight: 20,
    marginBottom: 20,
  },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 11,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
  },
  inputWithBtn: { paddingRight: 4 },
  eyeBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  forgotWrap: {
    minHeight: 44,
    alignSelf: "flex-end",
    justifyContent: "center",
    marginBottom: 4,
  },
  forgotText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.navy,
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
