import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

const SUPPORT_EMAIL = "support@globalsponsorhub.com";

export default function ContactScreen() {
  const ac = useAccountCopy();

  const router = useRouter();

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.pad}
          showsVerticalScrollIndicator={false}
        >
          <GshScreenIntro
            eyebrow={ac("Support")}
            title={ac("Contact")}
            subtitle={ac(
              "Contact us about your account or using the platform.",
            )}
            style={{ marginBottom: 14 }}
          />
          <View style={styles.accentBar} />

          <View style={[styles.card, cardSurfaceStyle(true)]}>
            <Text style={styles.label}>{ac("Email")}</Text>
            <Pressable
              onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
              accessibilityRole="link"
            >
              <Text style={styles.email}>{SUPPORT_EMAIL}</Text>
            </Pressable>
            <Text style={styles.hint}>
              {ac("Opens your email app with our address filled in.")}
            </Text>
          </View>

          <GshGradientPrimaryButton
            title={ac("Send feedback")}
            onPress={() => router.push("/feedback")}
            containerStyle={{ marginTop: 8 }}
          />

          <Text style={styles.foot}>
            {ac(
              "Read the terms, privacy and cookie policies in Settings → Legal.",
            )}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, paddingBottom: 40 },
  accentBar: { height: 3, backgroundColor: colors.teal, marginBottom: 18 },
  card: { padding: 18, borderRadius: radii.lg, marginBottom: 16 },
  label: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  email: {
    marginTop: 8,
    fontSize: 17,
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
  },
  hint: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 19,
  },
  foot: {
    marginTop: 24,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.placeholder,
    lineHeight: 19,
  },
});
