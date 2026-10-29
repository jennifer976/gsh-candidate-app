import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DepthButton } from "@/components/gsh-brand";
import { LegalConsentRegisterNote } from "@/components/LegalConsentLinks";
import { StepHeroCard } from "@/components/onboarding/StepHeroCard";
import { registerCandidate } from "@/lib/api-client";
import { persistCandidateReturnIntent } from "@/lib/candidate-return-intent";
import { markWelcomeSkipped } from "@/lib/guest-welcome";
import { colors, fontFamily, type } from "@/lib/theme";

function emailLooksValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function passwordStrength(password: string): 0 | 1 | 2 | 3 {
  if (password.length < 8) return password.length > 0 ? 1 : 0;
  let score = 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(3, score) as 1 | 2 | 3;
}

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const strength = passwordStrength(password);
  const passwordsMatch = password.length > 0 && password === confirm;
  const canSubmit =
    emailLooksValid(email) && password.length >= 8 && passwordsMatch;

  useEffect(() => {
    const returnTo = Array.isArray(params.returnTo)
      ? params.returnTo[0]
      : params.returnTo;
    if (returnTo) void persistCandidateReturnIntent(returnTo);
  }, [params.returnTo]);

  const mismatchError = useMemo(() => {
    if (!confirm) return null;
    if (password !== confirm) return "Passwords do not match";
    return null;
  }, [confirm, password]);

  async function onSubmit() {
    if (loading || !canSubmit) return;
    setFeedback(null);
    const e = email.trim().toLowerCase();
    setLoading(true);
    try {
      const data = await registerCandidate(e, password);
      router.replace({
        pathname: "/verify",
        params: {
          userId: data.userId,
          email: data.email || e,
          ...(typeof params.returnTo === "string"
            ? { returnTo: params.returnTo }
            : {}),
        },
      });
    } catch {
      setFeedback(
        "We could not create your account. Try again or contact support.",
      );
    } finally {
      setLoading(false);
    }
  }

  const skipToApp = async () => {
    await markWelcomeSkipped();
    router.replace("/(tabs)/home");
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/welcome")
          }
          style={styles.circleBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={20} color={colors.navy} />
        </Pressable>
        <Pressable
          onPress={() => void skipToApp()}
          style={styles.skipLink}
          accessibilityRole="button"
          accessibilityLabel="Skip to app"
        >
          <Text style={styles.skipText}>Skip to app</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StepHeroCard
            label="Create account"
            title="Join Global Sponsor Hub"
            photo="about-city"
          />

          <Text style={styles.title} accessibilityRole="header">
            Create your free account
          </Text>
          <Text style={styles.sub}>
            Signing up as a candidate. Free, always.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              placeholderTextColor={colors.placeholder}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              textContentType="newPassword"
              editable={!loading}
            />
            {password.length > 0 ? (
              <View style={styles.strengthBars}>
                {[1, 2, 3].map((step) => (
                  <View
                    key={step}
                    style={[
                      styles.strengthBar,
                      step <= strength && styles.strengthBarOn,
                    ]}
                  />
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm password *</Text>
            <TextInput
              style={styles.input}
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repeat new password"
              placeholderTextColor={colors.placeholder}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              textContentType="newPassword"
              editable={!loading}
            />
            {mismatchError ? (
              <Text style={styles.error}>{mismatchError}</Text>
            ) : null}
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Show password</Text>
            <Switch
              value={showPassword}
              onValueChange={setShowPassword}
              trackColor={{ false: colors.line, true: colors.cyan }}
              thumbColor={colors.white}
              accessibilityLabel="Show password"
            />
          </View>

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
            style={styles.signInRow}
            accessibilityRole="button"
          >
            <Text style={styles.signInText}>
              Already have an account? Sign in
            </Text>
          </Pressable>

          {feedback ? <Text style={styles.error}>{feedback}</Text> : null}

          <DepthButton
            title="Create account"
            onPress={() => void onSubmit()}
            loading={loading}
            disabled={!canSubmit || loading}
            variant="navy"
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    minHeight: 44,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  skipLink: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  skipText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  scroll: { paddingHorizontal: 20, gap: 14 },
  title: {
    marginTop: 20,
    fontFamily: fontFamily.headingStrong,
    fontSize: type.title.fontSize ?? 28,
    lineHeight: 32,
    color: colors.navy,
  },
  sub: {
    marginTop: -6,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text2,
  },
  field: { gap: 8 },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  input: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.navy,
    backgroundColor: colors.white,
  },
  strengthBars: { flexDirection: "row", gap: 6, marginTop: 4 },
  strengthBar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.panel,
  },
  strengthBarOn: { backgroundColor: colors.navy },
  error: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.error,
  },
  switchRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  signInRow: { minHeight: 44, justifyContent: "center" },
  signInText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
    textDecorationLine: "underline",
  },
  submit: { marginTop: 4 },
});
