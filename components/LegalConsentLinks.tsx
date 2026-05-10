import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { LEGAL_IN_APP } from "@/lib/legal/inAppRoutes";
import { colors, fontFamily } from "@/lib/theme";

/**
 * In-app links to bundled legal screens (readable before sign-in).
 */
export function LegalConsentRegisterNote() {
  const router = useRouter();

  return (
    <Text style={styles.consent}>
      By continuing, you agree to our{" "}
      <Text accessibilityRole="link" style={styles.link} onPress={() => router.push(LEGAL_IN_APP.terms)}>
        Terms
      </Text>{" "}
      and{" "}
      <Text accessibilityRole="link" style={styles.link} onPress={() => router.push(LEGAL_IN_APP.privacy)}>
        Privacy Policy
      </Text>
      .
    </Text>
  );
}

export function LegalConsentFooterRow() {
  const router = useRouter();

  const mk = (path: string, label: string) => (
    <Text accessibilityRole="link" style={styles.footerLink} onPress={() => router.push(path)}>
      {label}
    </Text>
  );

  return (
    <View style={styles.footerRow}>
      {mk(LEGAL_IN_APP.terms, "Terms")}
      <Text style={styles.footerSep}> · </Text>
      {mk(LEGAL_IN_APP.privacy, "Privacy")}
      <Text style={styles.footerSep}> · </Text>
      {mk(LEGAL_IN_APP.cookies, "Cookies")}
    </View>
  );
}

const styles = StyleSheet.create({
  consent: {
    marginTop: 18,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 19,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  link: {
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
    textDecorationLine: "underline",
  },
  footerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 0,
  },
  footerSep: { fontSize: 13, color: colors.textMuted, fontFamily: fontFamily.regular },
  footerLink: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
  },
});
