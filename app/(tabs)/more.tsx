import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { cardSurfaceStyle, colors, fontFamily } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

type RowDef = { title: string; subtitle: string; href: string; icon: IonName };

const LEARN_FIRST: RowDef[] = [
  {
    title: "Guides hub",
    subtitle: "Country guides & pillars — in the app",
    href: "/guides",
    icon: "compass-outline",
  },
  {
    title: "Tools & resources",
    subtitle: "ATS, career toolkit, blog, FAQs, legal — one hub",
    href: "/tools-resources",
    icon: "layers-outline",
  },
];

const LINKS: RowDef[] = [
  { title: "Dashboard", subtitle: "Applications, interviews, trends", href: "/dashboard", icon: "stats-chart-outline" },
  { title: "Notification inbox", subtitle: "Account & application updates", href: "/notification-feed", icon: "notifications-outline" },
  { title: "Job alerts", subtitle: "Matches, email prefs, saved searches", href: "/alerts", icon: "flash-outline" },
  { title: "Partner directory", subtitle: "Relocation, legal & services", href: "/partners", icon: "people-outline" },
  { title: "Offers & perks", subtitle: "Partner deals & codes", href: "/offers", icon: "gift-outline" },
  { title: "Career toolkit", subtitle: "CV tips & ATS assistant", href: "/tools", icon: "library-outline" },
  { title: "Feedback & support", subtitle: "Report issues or ideas", href: "/feedback", icon: "chatbox-ellipses-outline" },
  { title: "Settings", subtitle: "Password & preferences", href: "/settings", icon: "settings-outline" },
];

function RowLink({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: IonName;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.row, cardSurfaceStyle(true)]} onPress={onPress} accessibilityRole="button">
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={22} color={colors.brand} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
    </Pressable>
  );
}

export default function MoreScreen() {
  const router = useRouter();

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <Text style={styles.h1}>More</Text>
          <Text style={styles.lead}>Home feed, partners, and tooling — visa wizard and guides stay inside the app.</Text>

          <Text style={styles.section}>Learn & support</Text>
          <RowLink
            title="Visa wizard"
            subtitle="Sponsorship & mobility questionnaire — runs in the app"
            icon="sparkles-outline"
            onPress={() => router.push("/visa-wizard")}
          />
          {LEARN_FIRST.map((item) => (
            <RowLink
              key={item.title}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              onPress={() => router.push(item.href)}
            />
          ))}

          <Text style={styles.section}>Your hub</Text>
          {LINKS.map((item) => (
            <RowLink
              key={item.title}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              onPress={() => router.push(item.href)}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 16, paddingBottom: 40, gap: 10 },
  h1: { fontSize: 26, fontFamily: fontFamily.extraBold, color: colors.textPrimary, marginBottom: 8, letterSpacing: -0.4 },
  lead: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    marginBottom: 16,
    lineHeight: 22,
  },
  section: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.75,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
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
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.textPrimary },
  rowSub: { marginTop: 4, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 19 },
});
