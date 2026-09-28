import { AppLanguageSetting } from "@/components/AppLanguageSetting";
import { useAuthCopy } from "@/lib/i18n/useAuthCopy";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AuthFeedback, AuthField, AuthScaffold } from "@/components/AuthScaffold";
import { DepthButton, posterParts } from "@/components/gsh-brand";
import { LegalConsentFooterRow } from "@/components/LegalConsentLinks";
import { loginRequest } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import {
  parsePendingCandidateAction,
  persistCandidateReturnIntent,
} from "@/lib/candidate-return-intent";
import { colors, fontFamily } from "@/lib/theme";

export default function LoginScreen() {
  const ac = useAuthCopy();
  const acc = useAccountCopy();
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
      setFeedback("Enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const data = await loginRequest(e, password);
      const ut = String(data.user?.userType ?? "").toLowerCase();
      if (ut && ut !== "candidate") {
        setFeedback("This app is for candidates. Sign in on the website for employer, agency or specialist access.");
        return;
      }
      setAuth(data.token, data.user);
      router.dismissTo("/(tabs)/home");
    } catch {
      setFeedback("We could not sign you in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScaffold
      mode="signin"
      onSwitchMode={() =>
        router.replace({
          pathname: "/register",
          params: typeof params.returnTo === "string" ? { returnTo: params.returnTo } : undefined,
        })
      }
      {...posterParts(acc("Welcome|back."))}
      subtitle={ac("Save jobs, manage applications and plan your move.")}
      footer={
        <View style={styles.footer}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/home"))}
            style={styles.browse}
            accessibilityRole="button"
          >
            <Text style={styles.browseText}>{acc("Browse jobs without an account")}</Text>
            <Ionicons name="arrow-forward" size={15} color={colors.cyan} />
          </Pressable>
          <AppLanguageSetting />
          <LegalConsentFooterRow onDark />
        </View>
      }
    >
      <AuthField
        label={ac("Email")}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        placeholder="you@example.com"
        editable={!loading}
        value={email}
        onChangeText={setEmail}
        returnKeyType="next"
      />
      <AuthField
        label={ac("Password")}
        secureTextEntry={!passwordVisible}
        autoComplete="current-password"
        textContentType="password"
        placeholder="••••••••"
        editable={!loading}
        value={password}
        onChangeText={setPassword}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        trailing={
          <Pressable
            onPress={() => setPasswordVisible((v) => !v)}
            style={styles.eye}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? ac("Hide password") : ac("Show password")}
          >
            <Ionicons
              name={passwordVisible ? "eye-off-outline" : "eye-outline"}
              size={21}
              color="rgba(255,255,255,0.7)"
            />
          </Pressable>
        }
      />
      <Pressable
        onPress={() => router.push("/forgot-password")}
        style={styles.forgot}
        accessibilityRole="button"
      >
        <Text style={styles.forgotText}>{ac("Forgot password?")}</Text>
      </Pressable>
      {feedback ? <AuthFeedback>{ac(feedback)}</AuthFeedback> : null}
      <DepthButton title={ac("Sign in")} onPress={onSubmit} loading={loading} variant="cyanOnNavy" />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  eye: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
  forgot: { minHeight: 44, alignSelf: "flex-end", justifyContent: "center", marginTop: -6, marginBottom: 8 },
  forgotText: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.cyan },
  footer: { marginTop: 22, gap: 4 },
  browse: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  browseText: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.cyan },
});
