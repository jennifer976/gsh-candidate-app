import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { cardSurfaceStyle, colors, fontFamily } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

const LINKS: { title: string; subtitle: string; href: string; icon: IonName }[] = [
  { title: "Dashboard", subtitle: "Applications, interviews, trends", href: "/dashboard", icon: "stats-chart-outline" },
  { title: "Notification inbox", subtitle: "Account & application updates", href: "/notification-feed", icon: "notifications-outline" },
  { title: "Job alerts", subtitle: "Matches, email prefs, saved searches", href: "/alerts", icon: "flash-outline" },
  { title: "Partner directory", subtitle: "Relocation, legal & services", href: "/partners", icon: "people-outline" },
  { title: "Offers & perks", subtitle: "Partner deals & codes", href: "/offers", icon: "gift-outline" },
  { title: "Career toolkit", subtitle: "CV tips & ATS assistant", href: "/tools", icon: "library-outline" },
  { title: "Feedback & support", subtitle: "Report issues or ideas", href: "/feedback", icon: "chatbox-ellipses-outline" },
  { title: "Settings", subtitle: "Password & preferences", href: "/settings", icon: "settings-outline" },
];

export default function MoreScreen() {
  const router = useRouter();

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <Text style={styles.h1}>More</Text>
          <Text style={styles.lead}>Everything from the web candidate hub — on your phone.</Text>
          {LINKS.map((item) => (
            <Pressable
              key={item.title}
              style={[styles.row, cardSurfaceStyle(true)]}
              onPress={() => router.push(item.href)}
              accessibilityRole="button"
            >
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={22} color={colors.brand} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSub}>{item.subtitle}</Text>
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
  pad: { padding: 16, paddingBottom: 40, gap: 10 },
  h1: { fontSize: 26, fontFamily: fontFamily.extraBold, color: colors.textPrimary, marginBottom: 8, letterSpacing: -0.4 },
  lead: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    marginBottom: 18,
    lineHeight: 22,
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
