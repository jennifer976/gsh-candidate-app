import { AppLanguageSetting } from "@/components/AppLanguageSetting";
import { useAuthCopy } from "@/lib/i18n/useAuthCopy";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AuthFeedback, AuthField, AuthScaffold } from "@/components/AuthScaffold";
import { DepthButton, posterParts } from "@/components/gsh-brand";
import { LegalConsentRegisterNote } from "@/components/LegalConsentLinks";
import { registerCandidate } from "@/lib/api-client";
import { persistCandidateReturnIntent } from "@/lib/candidate-return-intent";
import { colors, fontFamily } from "@/lib/theme";

function passwordStrength(password: string): 0 | 1 | 2 | 3 {
  if (password.length < 8) return password.length > 0 ? 1 : 0;
  let score = 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(3, score) as 1 | 2 | 3;
}

export default function RegisterScreen() {
  const ac = useAuthCopy();
  const acc = useAccountCopy();
  const [feedback, setFeedback] = useState<Parameters<typeof ac>[0] | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const strength = passwordStrength(password);
  const strengthLabel = [
    "",
    acc("Use at least 8 characters"),
    acc("Good password"),
    acc("Strong password"),
  ][strength];

  useEffect(() => {
    const returnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
    if (returnTo) void persistCandidateReturnIntent(returnTo);
  }, [params.returnTo]);

  async function onSubmit() {
    if (loading) return;
    setFeedback(null);
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || !password || password.length < 8) {
      setFeedback("Use a valid email and a password of at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const data = await registerCandidate(e, password);
      router.replace({
        pathname: "/verify",
        params: {
          userId: data.userId,
          email: data.email || e,
          ...(typeof params.returnTo === "string" ? { returnTo: params.returnTo } : {}),
        },
      });
    } catch {
      setFeedback("We could not create your account. Try again or contact support.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScaffold
      mode="register"
      onSwitchMode={() =>
        router.replace({
          pathname: "/login",
          params: typeof params.returnTo === "string" ? { returnTo: params.returnTo } : undefined,
        })
      }
      {...posterParts(acc("Let's get you|moving."))}
      subtitle={ac("Explore jobs, save useful resources and choose who can contact you.")}
      footer={
        <View style={styles.footer}>
          <View style={styles.trust}>
            <View style={styles.trustItem}>
              <Ionicons name="lock-closed" size={14} color={colors.cyan} />
              <Text style={styles.trustText}>{acc("Private by default")}</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="card-outline" size={14} color={colors.cyan} />
              <Text style={styles.trustText}>{acc("No card needed")}</Text>
            </View>
          </View>
          <LegalConsentRegisterNote onDark />
          <AppLanguageSetting />
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
        autoComplete="new-password"
        textContentType="newPassword"
        placeholder={ac("At least 8 characters")}
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
      {strength > 0 ? (
        <View style={styles.strength} accessible accessibilityLabel={strengthLabel}>
          <View style={styles.strengthBars}>
            {[1, 2, 3].map((step) => (
              <View key={step} style={[styles.strengthBar, step <= strength && styles.strengthBarOn]} />
            ))}
          </View>
          <Text style={styles.strengthText}>{strengthLabel}</Text>
        </View>
      ) : null}
      {feedback ? <AuthFeedback>{ac(feedback)}</AuthFeedback> : null}
      <DepthButton title={ac("Create account")} onPress={onSubmit} loading={loading} variant="cyanOnNavy" />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  eye: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
  strength: { marginTop: -6, marginBottom: 18, gap: 6 },
  strengthBars: { flexDirection: "row", gap: 6 },
  strengthBar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.14)" },
  strengthBarOn: { backgroundColor: colors.cyan },
  strengthText: { fontFamily: fontFamily.semiBold, fontSize: 12, color: "rgba(255,255,255,0.7)" },
  footer: { marginTop: 18, gap: 4 },
  trust: { flexDirection: "row", justifyContent: "center", gap: 18, flexWrap: "wrap" },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  trustText: { fontFamily: fontFamily.semiBold, fontSize: 12, color: "rgba(255,255,255,0.8)" },
});
