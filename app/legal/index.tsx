import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { LEGAL_LAST_UPDATED } from "@/lib/legal/appLegalDocs";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

const ROWS: { slug: string; title: string; sub: string }[] = [
  { slug: "privacy-policy", title: "Privacy Policy", sub: "How we use and protect personal data" },
  { slug: "terms-and-conditions", title: "Terms & Conditions", sub: "Rules for using Global Sponsor Hub" },
  { slug: "cookie-policy", title: "Cookie Policy", sub: "Cookies and similar technologies (web context)" },
  { slug: "acceptable-use", title: "Acceptable Use", sub: "Fair use of messaging, listings, and features" },
];

export default function LegalHubScreen() {
  const router = useRouter();

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <Text style={styles.lead}>
            These policies are included here so you can read them anytime in the app. Last reviewed alignment:{" "}
            {LEGAL_LAST_UPDATED}.
          </Text>
          {ROWS.map((r) => (
            <Pressable
              key={r.slug}
              style={[styles.row, cardSurfaceStyle(true)]}
              onPress={() => router.push(`/legal/${r.slug}`)}
              accessibilityRole="button"
            >
              <View style={styles.iconCircle}>
                <Ionicons name="document-text-outline" size={22} color={colors.brand} />
              </View>
              <View style={styles.textCol}>
                <Text style={styles.title}>{r.title}</Text>
                <Text style={styles.sub}>{r.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 16, paddingBottom: 40, gap: 12 },
  lead: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radii.md,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.purpleMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  textCol: { flex: 1 },
  title: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.textPrimary },
  sub: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 18 },
});
