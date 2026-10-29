import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandStatePanel, DepthButton } from "@/components/gsh-brand";
import { StepHeroCard } from "@/components/onboarding/StepHeroCard";
import { resendSignupOtp, verifyOtpRequest } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { persistCandidateReturnIntent } from "@/lib/candidate-return-intent";
import { colors, fontFamily } from "@/lib/theme";

const CODE_LENGTH = 6;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    userId?: string | string[];
    email?: string | string[];
    returnTo?: string | string[];
  }>();
  const userId = useMemo(() => first(params.userId).trim(), [params.userId]);
  const email = useMemo(() => first(params.email).trim(), [params.email]);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const returnTo = first(params.returnTo);
    if (returnTo) void persistCandidateReturnIntent(returnTo);
  }, [params.returnTo]);

  async function onSubmit(value = code) {
    if (loading) return;
    setFeedback(null);
    setNotice(null);
    const c = value.trim();
    if (!userId || !/^\d{6}$/.test(c)) {
      setFeedback("Enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOtpRequest(userId, c);
      setAuth(data.token, data.user);
      router.replace({
        pathname: "/onboarding/[step]",
        params: { step: "2", mode: "signup" },
      });
    } catch {
      setFeedback("That code could not be verified. Check it and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (resending || !email) return;
    setFeedback(null);
    setNotice(null);
    setResending(true);
    try {
      await resendSignupOtp(userId, email);
      setNotice(`We sent a new code to ${email}.`);
    } catch {
      setFeedback("We could not send a new code. Try again in a moment.");
    } finally {
      setResending(false);
    }
  }

  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/register");

  if (!userId) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <BrandStatePanel
          icon="mail-unread-outline"
          title="Verify email"
          body="This link is incomplete. Return to sign up, or sign in if you already verified."
          primary={{
            label: "Create account",
            onPress: () => router.replace("/register"),
          }}
          secondary={{
            label: "Sign in instead",
            onPress: () => router.replace("/login"),
          }}
        />
      </View>
    );
  }

  const digits = Array.from({ length: CODE_LENGTH }, (_, i) => code[i] ?? "");
  const activeIndex = Math.min(code.length, CODE_LENGTH - 1);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={back}
          style={styles.circleBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={20} color={colors.navy} />
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
            label="Email verification"
            title="Check your inbox"
            photo="plan-perks"
          />

          <Text style={styles.title} accessibilityRole="header">
            Enter your code
          </Text>
          <Text style={styles.sub}>
            {email
              ? `Enter the code sent to ${email} to continue.`
              : "Enter the code sent to your email to continue."}
          </Text>

          <Pressable
            onPress={() => inputRef.current?.focus()}
            style={styles.codeRow}
            accessibilityRole="none"
            importantForAccessibility="no-hide-descendants"
          >
            {digits.map((digit, index) => {
              const active = focused && index === activeIndex;
              return (
                <View
                  key={index}
                  style={[styles.codeBox, active && styles.codeBoxActive]}
                >
                  <Text style={styles.codeDigit}>{digit}</Text>
                </View>
              );
            })}
          </Pressable>
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={(value) => {
              const next = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
              setCode(next);
              if (next.length === CODE_LENGTH) void onSubmit(next);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={CODE_LENGTH}
            autoFocus
            editable={!loading}
            accessibilityLabel="Verification code"
            style={styles.hiddenInput}
          />

          <Text style={styles.hint}>
            Codes contain six numbers, last 60 minutes, and can only be used once. Check your spam folder.
          </Text>
          <Pressable
            onPress={() => void onResend()}
            disabled={resending || !email}
            style={styles.resend}
            accessibilityRole="button"
            accessibilityLabel="Request a new code"
          >
            <Text style={styles.resendText}>
              {resending ? "Sending" : "Request a new code"}
            </Text>
          </Pressable>

          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          {feedback ? <Text style={styles.error}>{feedback}</Text> : null}

          <DepthButton
            title="Verify email"
            onPress={() => void onSubmit()}
            loading={loading}
            disabled={code.length < CODE_LENGTH || loading}
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
  scroll: { paddingHorizontal: 20, gap: 12 },
  title: {
    marginTop: 20,
    fontFamily: fontFamily.headingStrong,
    fontSize: 26,
    lineHeight: 30,
    color: colors.navy,
  },
  sub: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text2,
  },
  codeRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  codeBox: {
    width: 52,
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  codeBoxActive: {
    borderWidth: 2,
    borderColor: colors.navy,
  },
  codeDigit: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 22,
    color: colors.navy,
  },
  hiddenInput: { position: "absolute", opacity: 0, width: 1, height: 1 },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.text2,
  },
  resend: { minHeight: 44, justifyContent: "center" },
  resendText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
    textDecorationLine: "underline",
  },
  notice: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.navy,
  },
  error: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.error,
  },
  submit: { marginTop: 8 },
});
