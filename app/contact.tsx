import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

const SUPPORT_EMAIL = "support@globalsponsorhub.com";

export default function ContactScreen() {
  const router = useRouter();

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <Text style={styles.h1}>Contact</Text>
          <Text style={styles.lead}>
            Reach the team for account issues, billing questions on web subscriptions, or partnerships — without leaving
            your signed‑in app shell for our marketing site.
          </Text>

          <View style={[styles.card, cardSurfaceStyle(true)]}>
            <Text style={styles.label}>Email</Text>
            <Pressable onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)} accessibilityRole="link">
              <Text style={styles.email}>{SUPPORT_EMAIL}</Text>
            </Pressable>
            <Text style={styles.hint}>Opens your mail app with our address prefilled.</Text>
          </View>

          <GshGradientPrimaryButton
            title="Send in-app feedback"
            onPress={() => router.push("/feedback")}
            containerStyle={{ marginTop: 8 }}
          />

          <Text style={styles.foot}>
            For legal policies (privacy, terms, cookies), open Legal from Settings — documents are bundled inside this app.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 26, fontFamily: fontFamily.extraBold, color: colors.textPrimary, marginBottom: 10, letterSpacing: -0.35 },
  lead: { fontSize: 15, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 22, marginBottom: 20 },
  card: { padding: 18, borderRadius: radii.md, marginBottom: 16 },
  label: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.7 },
  email: { marginTop: 8, fontSize: 17, fontFamily: fontFamily.semiBold, color: colors.brand },
  hint: { marginTop: 10, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 19 },
  foot: { marginTop: 24, fontSize: 13, fontFamily: fontFamily.regular, color: colors.placeholder, lineHeight: 19 },
});
