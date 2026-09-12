import { AppLanguageSetting } from "@/components/AppLanguageSetting";
import { useAuthCopy } from "@/lib/i18n/useAuthCopy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import { verifyOtpRequest } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { persistCandidateReturnIntent } from "@/lib/candidate-return-intent";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function VerifyScreen() {
  const ac = useAuthCopy();
  const [feedback, setFeedback] = useState<Parameters<typeof ac>[0] | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams<{
    userId?: string | string[];
    returnTo?: string | string[];
  }>();
  const userIdParam = useMemo(() => {
    const raw = params.userId;
    if (Array.isArray(raw)) return raw[0] ?? "";
    return raw ?? "";
  }, [params.userId]);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [code, setCode] = useState("");
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
    const uid = String(userIdParam || "").trim();
    const c = code.trim();
    if (!uid || !/^\d{6}$/.test(c)) {
      setFeedback('Enter the 6-digit code from your email.');
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOtpRequest(uid, c);
      setAuth(data.token, data.user);
      router.replace("/(tabs)/home");
    } catch (err: unknown) {
      setFeedback("That code could not be verified. Check it and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!userIdParam.trim()) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <ScrollView
            contentContainerStyle={styles.scrollMiss}
            keyboardShouldPersistTaps="handled"
          >
            <AppLanguageSetting />
            <GshScreenIntro
              eyebrow="Global Sponsor Hub"
              title={ac("Verify email")}
              subtitle={ac(
                "This link is incomplete. Return to sign up, or sign in if you already verified.",
              )}
              style={{ marginBottom: 20 }}
            />
            <Pressable
              style={styles.missBtn}
              onPress={() => router.replace("/register")}
              accessibilityRole="button"
            >
              <Text style={styles.missBtnText}>{ac("Create account")}</Text>
            </Pressable>
            <Pressable
              style={styles.missLink}
              onPress={() => router.replace("/login")}
              accessibilityRole="button"
            >
              <Text style={styles.missLinkText}>{ac("Sign in instead")}</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AppLanguageSetting />
            <GshScreenIntro
              eyebrow="Global Sponsor Hub"
              title={ac("Verify email")}
              subtitle={ac(
                "Enter the code we emailed you to activate your candidate account.",
              )}
              style={{ marginBottom: 16 }}
            />

            <View style={styles.accentBar} />

            <View style={[cardSurfaceStyle(false), styles.card]}>
              <Text style={styles.label}>{ac("Verification code")}</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="characters"
                placeholder="123456"
                placeholderTextColor={colors.placeholder}
                accessibilityLabel={ac("Verification code")}
                editable={!loading}
                value={code}
                onChangeText={setCode}
              />

              {feedback && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ color: "#9f1239", backgroundColor: "#fff1f2", borderRadius: 12, padding: 12, marginBottom: 12, fontFamily: fontFamily.regular, lineHeight: 22 }}>{ac(feedback)}</Text>}
              <GshGradientPrimaryButton
                title={ac("Verify & continue")}
                onPress={onSubmit}
                loading={loading}
              />
            </View>

            <LegalConsentFooterRow />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  scrollMiss: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    justifyContent: "center",
  },
  accentBar: { height: 3, backgroundColor: colors.teal, marginBottom: 18 },
  card: {
    padding: 20,
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
    fontSize: 18,
    letterSpacing: 2,
    fontFamily: fontFamily.semiBold,
    backgroundColor: colors.background,
    marginBottom: 18,
    color: colors.textPrimary,
  },
  missBtn: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
    alignItems: "center",
  },
  missBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.white,
  },
  missLink: { marginTop: 20, alignItems: "center" },
  missLinkText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.brand,
  },
});
