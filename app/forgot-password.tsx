import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { LegalConsentFooterRow } from "@/components/LegalConsentLinks";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { requestForgotPassword } from "@/lib/api-client";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const mut = useMutation({
    mutationFn: () => requestForgotPassword(email.trim().toLowerCase()),
    onSuccess: (data) => {
      Alert.alert("Check your email", data.message || "If an account exists, we sent reset instructions.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (e: unknown) =>
      Alert.alert(
        "Request failed",
        e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Try again."
      ),
  });

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View style={styles.pad}>
            <Text style={styles.eyebrow}>Global Sponsor Hub</Text>
            <Text style={styles.h1}>Forgot password</Text>
            <Text style={styles.lead}>We will email you a link to reset your password.</Text>

            <View style={[cardSurfaceStyle(false), styles.formCard]}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.placeholder}
              />
              <GshGradientPrimaryButton
                title={mut.isPending ? "Sending…" : "Send reset link"}
                onPress={() => mut.mutate()}
                disabled={mut.isPending}
              />
            </View>

            <Pressable style={styles.back} onPress={() => router.back()} accessibilityRole="button">
              <Text style={styles.backText}>Back to sign in</Text>
            </Pressable>

            <LegalConsentFooterRow />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 24, flex: 1 },
  eyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  h1: { fontFamily: fontFamily.extraBold, fontSize: 26, letterSpacing: -0.35, color: colors.textPrimary, marginBottom: 8 },
  lead: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 20,
    lineHeight: 22,
  },
  formCard: {
    padding: 18,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.teal,
    backgroundColor: colors.background,
  },
  label: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textSecondary, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    backgroundColor: colors.background,
    marginBottom: 16,
    color: colors.textPrimary,
  },
  back: { marginTop: 24, alignItems: "center", paddingVertical: 8 },
  backText: { color: colors.brand, fontFamily: fontFamily.semiBold, fontSize: 15 },
});
