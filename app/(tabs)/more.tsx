import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshLinkRow, GshScreenIntro, GshSectionTitle, type GshLinkAccent } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";

type IonName = ComponentProps<typeof Ionicons>["name"];

type RowDef = { title: string; subtitle: string; href: string; icon: IonName; accent: GshLinkAccent };

const LEARN_FIRST: RowDef[] = [
  {
    title: "Guides hub",
    subtitle: "Country guides & pillars — in the app",
    href: "/guides",
    icon: "compass-outline",
    accent: "ocean",
  },
  {
    title: "Tools & resources",
    subtitle: "ATS, career toolkit, blog, FAQs, legal — one hub",
    href: "/tools-resources",
    icon: "layers-outline",
    accent: "purple",
  },
];

const LINKS: RowDef[] = [
  { title: "Dashboard", subtitle: "Applications, interviews, trends", href: "/dashboard", icon: "stats-chart-outline", accent: "purple" },
  { title: "Notification inbox", subtitle: "Account & application updates", href: "/notification-feed", icon: "notifications-outline", accent: "teal" },
  { title: "Job alerts", subtitle: "Matches, email prefs, saved searches", href: "/alerts", icon: "flash-outline", accent: "ocean" },
  { title: "Partner directory", subtitle: "Relocation, legal & services", href: "/partners", icon: "people-outline", accent: "teal" },
  { title: "Offers & perks", subtitle: "Partner deals & codes", href: "/offers", icon: "gift-outline", accent: "purple" },
  { title: "Career toolkit", subtitle: "CV tips & ATS assistant", href: "/tools", icon: "library-outline", accent: "purple" },
  { title: "Feedback & support", subtitle: "Report issues or ideas", href: "/feedback", icon: "chatbox-ellipses-outline", accent: "teal" },
  { title: "Settings", subtitle: "Password & preferences", href: "/settings", icon: "settings-outline", accent: "ocean" },
];

export default function MoreScreen() {
  const router = useRouter();

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <GshScreenIntro
            eyebrow="More"
            title="Menu"
            subtitle="Guides, tools, partners, alerts, and settings — everything beyond your main tabs lives here."
            style={{ marginBottom: 8 }}
          />

          <GshSectionTitle title="Learn & support" topSpacing="none" />
          <GshLinkRow
            title="Visa wizard"
            subtitle="Sponsorship & mobility questionnaire — runs in the app"
            icon="sparkles-outline"
            accent="teal"
            onPress={() => router.push("/visa-wizard")}
          />
          {LEARN_FIRST.map((item) => (
            <GshLinkRow
              key={item.title}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              accent={item.accent}
              onPress={() => router.push(item.href)}
            />
          ))}

          <GshSectionTitle title="Your hub" />
          {LINKS.map((item) => (
            <GshLinkRow
              key={item.title}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              accent={item.accent}
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
  pad: { padding: 16, paddingBottom: 40, gap: 12 },
});
