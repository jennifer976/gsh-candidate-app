import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
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
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const email = useMemo(() => {
    const raw = params.email;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return decodeURIComponent(value ?? "").trim().toLowerCase();
  }, [params.email]);

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!email) {
      Alert.alert("Email missing", "Start again from forgot password and enter your email.");
      return;
    }
    const otp = code.trim();
    if (!otp) {
      Alert.alert("Enter your code", "Use the one-time code from your email.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Password too short", "Use at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords do not match", "Check your new password and confirmation.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithOtp(email, otp, newPassword);
      Alert.alert("Password updated", "You can sign in with your new password.", [
        { text: "Sign in", onPress: () => router.replace("/login") },
      ]);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Could not reset password. Check the code and try again.";
      Alert.alert("Reset failed", msg);
    } finally {
      setLoading(false);
    }
  }

  if (!email) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <ScrollView contentContainerStyle={styles.pad}>
            <GshScreenIntro
              title="Reset password"
              subtitle="We need your email to continue. Go back and request a new code."
              style={{ marginBottom: 16 }}
            />
            <Pressable style={styles.back} onPress={() => router.replace("/forgot-password")} accessibilityRole="button">
              <Text style={styles.backText}>Forgot password</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <GshScreenIntro
              eyebrow="Global Sponsor Hub"
              title="Reset password"
              subtitle={`Enter the code we sent to ${email} and choose a new password.`}
              style={{ marginBottom: 16 }}
            />

            <LinearGradient colors={[colors.teal, colors.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accentBar} />

            <View style={[cardSurfaceStyle(false), styles.formCard]}>
              <Text style={styles.label}>One-time code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                autoCapitalize="characters"
                autoCorrect={false}
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
                placeholder="123456"
                placeholderTextColor={colors.placeholder}
                accessibilityLabel="Verification code"
              />

              <Text style={styles.label}>New password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="At least 8 characters"
                placeholderTextColor={colors.placeholder}
                accessibilityLabel="New password"
              />

              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat new password"
                placeholderTextColor={colors.placeholder}
                accessibilityLabel="Confirm password"
              />

              <GshGradientPrimaryButton title="Reset password" onPress={onSubmit} loading={loading} />
            </View>

            <Pressable style={styles.back} onPress={() => router.replace("/forgot-password")} accessibilityRole="button">
              <Text style={styles.backText}>Resend code</Text>
            </Pressable>

            <Pressable style={styles.back} onPress={() => router.replace("/login")} accessibilityRole="button">
              <Text style={styles.backText}>Back to sign in</Text>
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
  accentBar: { height: 4, borderRadius: 2, marginBottom: 18 },
  formCard: {
    padding: 20,
    marginBottom: 8,
    borderRadius: radii.lg,
    backgroundColor: colors.background,
  },
  label: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textSecondary, marginBottom: 8 },
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
  backText: { color: colors.brand, fontFamily: fontFamily.semiBold, fontSize: 15 },
});
