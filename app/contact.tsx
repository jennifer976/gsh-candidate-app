import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

const SUPPORT_EMAIL = "support@globalsponsorhub.com";

export default function ContactScreen() {
  const router = useRouter();

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <GshScreenIntro
            eyebrow="Support"
            title="Contact"
            subtitle="Reach the team for account issues, billing on subscriptions you bought through our website, or partnerships — all from this screen."
            style={{ marginBottom: 14 }}
          />
          <LinearGradient colors={[colors.teal, colors.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accentBar} />

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
  accentBar: { height: 4, borderRadius: 2, marginBottom: 18 },
  card: { padding: 18, borderRadius: radii.lg, marginBottom: 16 },
  label: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textSecondary, marginBottom: 6 },
  email: { marginTop: 8, fontSize: 17, fontFamily: fontFamily.semiBold, color: colors.brand },
  hint: { marginTop: 10, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 19 },
  foot: { marginTop: 24, fontSize: 13, fontFamily: fontFamily.regular, color: colors.placeholder, lineHeight: 19 },
});
