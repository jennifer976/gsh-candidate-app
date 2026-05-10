import { StyleSheet, Text, View } from "react-native";
import { LEGAL_PATHS } from "@/lib/marketing-paths";
import { openMarketingBrowser } from "@/lib/openMarketingBrowser";
import { colors, fontFamily } from "@/lib/theme";

/**
 * In-app entry points to website-hosted legal pages (system browser).
 * Used on auth screens so policies are reachable before sign-in.
 */
export function LegalConsentRegisterNote() {
  return (
    <Text style={styles.consent}>
      By continuing, you agree to our{" "}
      <Text
        accessibilityRole="link"
        style={styles.link}
        onPress={() => void openMarketingBrowser(LEGAL_PATHS.terms)}
      >
        Terms
      </Text>{" "}
      and{" "}
      <Text
        accessibilityRole="link"
        style={styles.link}
        onPress={() => void openMarketingBrowser(LEGAL_PATHS.privacy)}
      >
        Privacy Policy
      </Text>
      . Legal pages open in your browser.
    </Text>
  );
}

export function LegalConsentFooterRow() {
  const mk = (path: string, label: string) => (
    <Text
      accessibilityRole="link"
      style={styles.footerLink}
      onPress={() => void openMarketingBrowser(path)}
    >
      {label}
    </Text>
  );

  return (
    <View style={styles.footerRow}>
      {mk(LEGAL_PATHS.terms, "Terms")}
      <Text style={styles.footerSep}> · </Text>
      {mk(LEGAL_PATHS.privacy, "Privacy")}
      <Text style={styles.footerSep}> · </Text>
      {mk(LEGAL_PATHS.cookies, "Cookies")}
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
