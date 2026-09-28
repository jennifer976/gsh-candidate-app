import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppLanguageSetting } from "@/components/AppLanguageSetting";
import { GshScreenShell } from "@/components/GshScreenShell";
import {
  DecorRing,
  DepthButton,
  Eyebrow,
  PosterTitle,
  posterParts,
  SectionHeading,
} from "@/components/gsh-brand";
import { tabBarBottomPadding } from "@/lib/android-insets";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useSignInPrompt } from "@/lib/useSignInPrompt";
import { colors, fontFamily } from "@/lib/theme";

/** Profile tab for signed-out visitors: sign in or register, plus language. */
export function GuestProfileHub() {
  const ac = useAccountCopy();
  const insets = useSafeAreaInsets();
  const { openSignIn, openRegister } = useSignInPrompt();

  return (
    <GshScreenShell constrainTabletWidth>
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarBottomPadding(insets.bottom) + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { paddingTop: Math.max(insets.top, 12) + 14 }]}>
          <DecorRing size={260} thickness={36} color="rgba(255,255,255,0.3)" style={{ top: -110, right: -100 }} />
          <Eyebrow color={colors.navy}>{ac("Your account")}</Eyebrow>
          <PosterTitle {...posterParts(ac("Start your|move."))} size={38} style={styles.title} />
          <Text style={styles.body}>
            {ac("Create a free account to save jobs, apply and hear from employers.")}
          </Text>
          <DepthButton
            title={ac("Create a free account")}
            onPress={() => openRegister("/(tabs)/profile")}
            variant="navy"
            style={styles.primary}
          />
          <DepthButton
            title={ac("Sign in")}
            onPress={() => openSignIn("/(tabs)/profile")}
            variant="white"
            bordered
            icon={null}
            size="md"
            style={styles.secondary}
          />
          <View style={styles.trustRow}>
            <Ionicons name="lock-closed" size={13} color={colors.navy} />
            <Text style={styles.trustText}>{ac("Free for candidates. Private by default.")}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeading title={ac("Language")} style={styles.heading} />
          <AppLanguageSetting />
        </View>
      </ScrollView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.cyan,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  title: { marginTop: 8 },
  body: {
    marginTop: 14,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(13,25,78,0.8)",
  },
  primary: { marginTop: 20 },
  secondary: { marginTop: 12 },
  trustRow: { marginTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  trustText: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.navy },
  section: { paddingHorizontal: 20, marginTop: 28 },
  heading: { marginBottom: 12 },
});
