import { AppLanguageSetting } from "@/components/AppLanguageSetting";
import { useAuthCopy } from "@/lib/i18n/useAuthCopy";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { requestForgotPassword } from "@/lib/api-client";
import { STACK_HEADER_BODY_GAP } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function ForgotPasswordScreen() {
  const ac = useAuthCopy();
  const [feedback, setFeedback] = useState<Parameters<typeof ac>[0] | null>(null);
  const router = useRouter();
  const [email, setEmail] = useState("");

  const mut = useMutation({
    mutationFn: (address: string) => requestForgotPassword(address),
    onSuccess: (_, address) => {
      const normalized = address;
      router.replace({
        pathname: "/reset-password",
        params: { email: normalized },
      });
    },
    onError: () => setFeedback("We could not send a code. Check the address and try again."),
  });

  const sendCode = () => {
    if (mut.isPending) return;
    setFeedback(null);
    const address = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setFeedback("Enter a valid email address.");
      return;
    }
    mut.mutate(address);
  };
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
              title={ac("Forgot password")}
              subtitle={ac(
                "We will email you a one-time code to reset your password.",
              )}
              style={{ marginBottom: 16 }}
            />

            <View style={styles.accentBar} />

            <View style={[cardSurfaceStyle(false), styles.formCard]}>
              <Text style={styles.label}>{ac("Email")}</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                accessibilityLabel={ac("Email")}
                editable={!mut.isPending}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.placeholder}
              />
              {feedback && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ color: "#9f1239", backgroundColor: "#fff1f2", borderRadius: 12, padding: 12, marginBottom: 12, fontFamily: fontFamily.regular, lineHeight: 22 }}>{ac(feedback)}</Text>}
              <GshGradientPrimaryButton
                title={mut.isPending ? ac("Sending…") : ac("Send code")}
                onPress={sendCode}
                disabled={mut.isPending}
              />
            </View>

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
  back: { marginTop: 24, alignItems: "center", paddingVertical: 8 },
  backText: {
    color: colors.brand,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
  },
});
