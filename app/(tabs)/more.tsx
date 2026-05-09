import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LINKS: { title: string; subtitle: string; href: string }[] = [
  { title: "Dashboard", subtitle: "Applications, interviews, trends", href: "/dashboard" },
  { title: "Notification inbox", subtitle: "Account & application updates", href: "/notification-feed" },
  { title: "Job alerts", subtitle: "Matches, email prefs, saved searches", href: "/alerts" },
  { title: "Partner directory", subtitle: "Relocation, legal & services", href: "/partners" },
  { title: "Offers & perks", subtitle: "Partner deals & codes", href: "/offers" },
  { title: "Career toolkit", subtitle: "CV tips & ATS assistant", href: "/tools" },
  { title: "Feedback & support", subtitle: "Report issues or ideas", href: "/feedback" },
  { title: "Settings", subtitle: "Password & preferences", href: "/settings" },
];

export default function MoreScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.h1}>More</Text>
        <Text style={styles.lead}>Everything from the web candidate hub — on your phone.</Text>
        {LINKS.map((item) => (
          <Pressable key={item.title} style={styles.row} onPress={() => router.push(item.href)}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.rowSub}>{item.subtitle}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  pad: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 8 },
  lead: { fontSize: 14, color: "#64748b", marginBottom: 16, lineHeight: 20 },
  row: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  rowTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  rowSub: { marginTop: 4, fontSize: 14, color: "#64748b" },
});
