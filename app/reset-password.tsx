import { AppLanguageSetting } from "@/components/AppLanguageSetting";
import { useAuthCopy } from "@/lib/i18n/useAuthCopy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
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
import { resetPasswordWithOtp } from "@/lib/api-client";
import { STACK_HEADER_BODY_GAP } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function ResetPasswordScreen() {
  const ac = useAuthCopy();
  const [feedback, setFeedback] = useState<Parameters<typeof ac>[0] | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const email = useMemo(() => {
    const raw = params.email;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return (value ?? "")
      .trim()
      .toLowerCase();
  }, [params.email]);

  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (loading) return;
    setFeedback(null);
    if (!email) {
      setFeedback('Start again from forgot password and enter your email.');
      return;
    }
    const otp = code.trim();
    if (!/^\d{6}$/.test(otp)) {
      setFeedback('Use the one-time code from your email.');
      return;
    }
    if (newPassword.length < 8) {
      setFeedback('Use at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback('Check your new password and confirmation.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithOtp(email, otp, newPassword);
      setPasswordUpdated(true);
    } catch (err: unknown) {
      setFeedback("Could not reset password. Check the code and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (passwordUpdated) return (
    <GshScreenBackground><SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.pad}>
        <AppLanguageSetting />
        <GshScreenIntro title={ac("Password updated")} subtitle={ac("You can sign in with your new password.")} style={{ marginBottom: 24 }} />
        <GshGradientPrimaryButton title={ac("Sign in")} onPress={() => router.replace("/login")} />
      </ScrollView>
    </SafeAreaView></GshScreenBackground>
  );

  if (!email) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <ScrollView contentContainerStyle={styles.pad}>
            <AppLanguageSetting />
            <GshScreenIntro
              title={ac("Reset password")}
              subtitle={ac("This link is incomplete. Request a new code.")}
              style={{ marginBottom: 16 }}
            />
            <Pressable
              style={styles.back}
              onPress={() => router.replace("/forgot-password")}
              accessibilityRole="button"
            >
              <Text style={styles.backText}>{ac("Forgot password")}</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.pad}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AppLanguageSetting />
            <GshScreenIntro
              eyebrow="Global Sponsor Hub"
              title={ac("Reset password")}
              subtitle={ac(
                "Enter the code sent to {email} and choose a new password.",
                { email },
              )}
              style={{ marginBottom: 16 }}
            />

            <View style={styles.accentBar} />

            <View style={[cardSurfaceStyle(false), styles.formCard]}>
              <Text style={styles.label}>{ac("One-time code")}</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                autoCapitalize="characters"
                autoCorrect={false}
                keyboardType="number-pad"
                editable={!loading}
                value={code}
                onChangeText={setCode}
                placeholder="123456"
                placeholderTextColor={colors.placeholder}
                accessibilityLabel={ac("Verification code")}
              />

              <Text style={styles.label}>{ac("New password")}</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={ac("At least 8 characters")}
                placeholderTextColor={colors.placeholder}
                accessibilityLabel={ac("New password")}
              />

              <Text style={styles.label}>{ac("Confirm password")}</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={ac("Repeat new password")}
                placeholderTextColor={colors.placeholder}
                accessibilityLabel={ac("Confirm password")}
              />

              {feedback && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ color: "#9f1239", backgroundColor: "#fff1f2", borderRadius: 12, padding: 12, marginBottom: 12, fontFamily: fontFamily.regular, lineHeight: 22 }}>{ac(feedback)}</Text>}
              <GshGradientPrimaryButton
                title={ac("Reset password")}
                onPress={onSubmit}
                loading={loading}
              />
            </View>

            <Pressable
              style={styles.back}
              onPress={() => router.replace("/forgot-password")}
              accessibilityRole="button"
            >
              <Text style={styles.backText}>{ac("Resend code")}</Text>
            </Pressable>

            <Pressable
              style={styles.back}
              onPress={() => router.replace("/login")}
              accessibilityRole="button"
            >
              <Text style={styles.backText}>{ac("Back to sign in")}</Text>
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
  pad: {
    paddingHorizontal: 24,
    paddingTop: STACK_HEADER_BODY_GAP,
    flexGrow: 1,
    paddingBottom: 40,
  },
  accentBar: { height: 3, backgroundColor: colors.teal, marginBottom: 18 },
  formCard: {
    padding: 20,
    marginBottom: 8,
    borderRadius: radii.lg,
    backgroundColor: colors.background,
  },
  label: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    backgroundColor: colors.background,
    marginBottom: 16,
    color: colors.textPrimary,
  },
  codeInput: {
    fontSize: 20,
    letterSpacing: 4,
    fontFamily: fontFamily.semiBold,
  },
  back: { marginTop: 12, alignItems: "center", paddingVertical: 8 },
  backText: {
    color: colors.brand,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
  },
});
