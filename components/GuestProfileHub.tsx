import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppLanguageSetting } from "@/components/AppLanguageSetting";
import { GshScreenShell } from "@/components/GshScreenShell";
import {
  BrandLinkRow,
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

type IonName = ComponentProps<typeof Ionicons>["name"];

const EXPLORE: Array<{ icon: IonName; label: string; hint: string; href: string }> = [
  { icon: "briefcase-outline", label: "Browse jobs", hint: "Sponsored and relocation-friendly roles", href: "/(tabs)/jobs" },
  { icon: "globe-outline", label: "Country guides", hint: "Visa routes, costs and everyday life", href: "/countries" },
  { icon: "business-outline", label: "Companies", hint: "Employers hiring international talent", href: "/companies" },
  { icon: "construct-outline", label: "Tools & resources", hint: "Templates, checklists and calculators", href: "/tools-resources" },
  { icon: "people-outline", label: "Specialists", hint: "Immigration and relocation partners", href: "/partners" },
];

const HELP: Array<{ icon: IonName; label: string; href: string }> = [
  { icon: "help-circle-outline", label: "FAQs", href: "/faq" },
  { icon: "mail-outline", label: "Contact us", href: "/contact" },
  { icon: "document-text-outline", label: "Legal", href: "/legal" },
];

/** Profile tab for signed-out visitors: account benefits, open areas of the app, language and help. */
export function GuestProfileHub() {
  const ac = useAccountCopy();
  const router = useRouter();
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
          <SectionHeading eyebrow={ac("No account needed")} title={ac("Explore the app")} style={styles.heading} />
          {EXPLORE.map((row) => (
            <BrandLinkRow
              key={row.href}
              icon={row.icon}
              label={ac(row.label)}
              hint={ac(row.hint)}
              onPress={() => router.push(row.href as never)}
              style={styles.row}
            />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeading title={ac("Language")} style={styles.heading} />
          <AppLanguageSetting />
        </View>

        <View style={styles.section}>
          <SectionHeading title={ac("Help and legal")} style={styles.heading} />
          {HELP.map((row) => (
            <BrandLinkRow
              key={row.href}
              icon={row.icon}
              label={ac(row.label)}
              onPress={() => router.push(row.href as never)}
              style={styles.row}
            />
          ))}
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
  row: { marginBottom: 10 },
});
