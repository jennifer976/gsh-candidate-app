import { useAuthCopy } from "@/lib/i18n/useAuthCopy";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthFeedback } from "@/components/AuthScaffold";
import {
  BrandStatePanel,
  DecorRing,
  DepthButton,
  DepthSurface,
  PosterTitle,
  posterParts,
} from "@/components/gsh-brand";
import { LegalConsentFooterRow } from "@/components/LegalConsentLinks";
import { resendSignupOtp, verifyOtpRequest } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { persistCandidateReturnIntent } from "@/lib/candidate-return-intent";
import { colors, fontFamily } from "@/lib/theme";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default function VerifyScreen() {
  const ac = useAuthCopy();
  const acc = useAccountCopy();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const router = useRouter();
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
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const returnTo = first(params.returnTo);
    if (returnTo) void persistCandidateReturnIntent(returnTo);
  }, [params.returnTo]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  async function onSubmit(value = code) {
    if (loading) return;
    setFeedback(null);
    setNotice(null);
    const c = value.trim();
    if (!userId || !/^\d{6}$/.test(c)) {
      setFeedback(ac("Enter the 6-digit code from your email."));
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOtpRequest(userId, c);
      setAuth(data.token, data.user);
      router.dismissTo("/(tabs)/home");
    } catch {
      setFeedback(ac("That code could not be verified. Check it and try again."));
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
      setNotice(acc("We sent a new code to {email}.", { email }));
      setSecondsLeft(RESEND_SECONDS);
    } catch {
      setFeedback(acc("We could not send a new code. Try again in a moment."));
    } finally {
      setResending(false);
    }
  }

  const back = () => (router.canGoBack() ? router.back() : router.replace("/register"));

  if (!userId) {
    return (
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.missing}>
          <BrandStatePanel
            icon="mail-unread-outline"
            tone="cyan"
            title={ac("Verify email")}
            body={ac("This link is incomplete. Return to sign up, or sign in if you already verified.")}
            primary={{ label: ac("Create account"), onPress: () => router.replace("/register") }}
            secondary={{ label: ac("Sign in instead"), onPress: () => router.replace("/login") }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const digits = Array.from({ length: CODE_LENGTH }, (_, i) => code[i] ?? "");
  const activeIndex = Math.min(code.length, CODE_LENGTH - 1);

  return (
    <View style={styles.root}>
      <DecorRing size={300} thickness={44} color="rgba(255,255,255,0.3)" style={{ top: -120, right: -120 }} />
      <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topRow}>
              <Pressable
                onPress={back}
                style={styles.back}
                accessibilityRole="button"
                accessibilityLabel={acc("Back")}
                hitSlop={6}
              >
                <Ionicons name="chevron-back" size={22} color={colors.navy} />
              </Pressable>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </View>

            <DepthSurface
              face={colors.navy}
              depthColor={colors.navyDeep}
              depth={6}
              radius={26}
              style={styles.badge}
            >
              <View style={styles.badgeInner}>
                <Ionicons name="mail-unread" size={38} color={colors.cyan} />
              </View>
            </DepthSurface>

            <PosterTitle {...posterParts(acc("Check your|inbox."))} size={40} style={styles.title} />
            <Text style={styles.subtitle}>
              {email
                ? acc("Enter the 6-digit code we sent to {email}.", { email })
                : ac("Enter the code we emailed you to activate your candidate account.")}
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
                    style={[styles.codeBox, digit ? styles.codeBoxFilled : null, active && styles.codeBoxActive]}
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
              accessibilityLabel={ac("Verification code")}
              style={styles.hiddenInput}
            />

            <View style={styles.resendRow}>
              {!email ? null : secondsLeft > 0 ? (
                <Text style={styles.resendMuted}>
                  {acc("You can ask for a new code in {seconds}s", { seconds: secondsLeft })}
                </Text>
              ) : (
                <Pressable onPress={onResend} disabled={resending} accessibilityRole="button" hitSlop={8}>
                  <Text style={styles.resendLink}>{resending ? acc("Sending…") : acc("Send a new code")}</Text>
                </Pressable>
              )}
            </View>

            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            {feedback ? <AuthFeedback>{feedback}</AuthFeedback> : null}

            <DepthSurface depth={4} radius={18} borderWidth={2} borderColor={colors.navy} style={styles.tip}>
              <View style={styles.tipInner}>
                <Ionicons name="bulb-outline" size={18} color={colors.navy} />
                <Text style={styles.tipText}>
                  {acc("Can't see it? Check spam, then send a new code. Codes last 60 minutes.")}
                </Text>
              </View>
            </DepthSurface>

            <DepthButton
              title={ac("Verify & continue")}
              onPress={() => void onSubmit()}
              loading={loading}
              variant="navy"
              disabled={code.length < CODE_LENGTH}
              style={styles.submit}
            />
            <LegalConsentFooterRow />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cyan, overflow: "hidden" },
  flex: { flex: 1 },
  missing: { flexGrow: 1, justifyContent: "center" },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 14, minHeight: 48 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.55)",
    overflow: "hidden",
  },
  progressFill: { width: "66%", height: "100%", borderRadius: 5, backgroundColor: colors.navy },
  badge: { alignSelf: "flex-start", marginTop: 28 },
  badgeInner: { width: 76, height: 76, alignItems: "center", justifyContent: "center" },
  title: { marginTop: 22 },
  subtitle: {
    marginTop: 14,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(13,25,78,0.82)",
  },
  codeRow: { marginTop: 24, flexDirection: "row", justifyContent: "space-between", gap: 8 },
  codeBox: {
    flex: 1,
    maxWidth: 54,
    aspectRatio: 0.82,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(13,25,78,0.25)",
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  codeBoxFilled: { borderColor: colors.navy, backgroundColor: colors.white },
  codeBoxActive: { borderColor: colors.navy, borderBottomWidth: 5 },
  codeDigit: { fontFamily: fontFamily.headingStrong, fontSize: 24, color: colors.navy },
  hiddenInput: { position: "absolute", opacity: 0, width: 1, height: 1 },
  resendRow: { minHeight: 44, justifyContent: "center", marginTop: 8 },
  resendMuted: { fontFamily: fontFamily.medium, fontSize: 13, color: "rgba(13,25,78,0.7)" },
  resendLink: { fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.navy, textDecorationLine: "underline" },
  notice: { marginBottom: 12, fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.navy },
  tip: { marginTop: 4 },
  tipInner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  tipText: { flex: 1, fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 19, color: colors.navy },
  submit: { marginTop: 20 },
});
