import { LinearGradient } from "expo-linear-gradient";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
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
          <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <GshScreenIntro
              eyebrow="Global Sponsor Hub"
              title="Forgot password"
              subtitle="We will email you a link to reset your password."
              style={{ marginBottom: 16 }}
            />

            <LinearGradient colors={[colors.teal, colors.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accentBar} />

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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 24, flexGrow: 1, paddingBottom: 40 },
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
  back: { marginTop: 24, alignItems: "center", paddingVertical: 8 },
  backText: { color: colors.brand, fontFamily: fontFamily.semiBold, fontSize: 15 },
});
