import { useQuery } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchImmigrationRssHeadlines } from "@/lib/content/rssImmigration";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function ImmigrationNewsScreen() {
  const q = useQuery({
    queryKey: ["rss", "immigration-headlines"],
    queryFn: fetchImmigrationRssHeadlines,
    staleTime: 3600_000,
  });

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {q.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
            <Text style={styles.lead}>
              Immigration and mobility headlines from third‑party publishers (government agencies, NGOs, and analysts).
              Tapping a row opens that publisher’s website so you can read the full story.
            </Text>
            {(q.data ?? []).map((h, i) => (
              <Pressable
                key={`${h.link}-${i}`}
                style={[styles.row, cardSurfaceStyle(true)]}
                onPress={() => void Linking.openURL(h.link)}
                accessibilityRole="button"
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.source}>{h.source}</Text>
                  <Text style={styles.title}>{h.title}</Text>
                  {h.isoDate ? <Text style={styles.date}>{h.isoDate.slice(0, 10)}</Text> : null}
                </View>
                <Text style={styles.open}>Open ↗</Text>
              </Pressable>
            ))}
            {q.data?.length === 0 ? (
              <Text style={styles.empty}>Headlines could not be loaded. Pull to refresh later.</Text>
            ) : null}
          </ScrollView>
        )}
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  pad: { padding: 16, paddingBottom: 40, gap: 12 },
  lead: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 21, marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: radii.md,
  },
  source: { fontSize: 11, fontFamily: fontFamily.bold, color: colors.teal, textTransform: "uppercase", letterSpacing: 0.6 },
  title: { marginTop: 6, fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.textPrimary, lineHeight: 22 },
  date: { marginTop: 6, fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted },
  open: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.brand },
  empty: { fontSize: 14, color: colors.textMuted, fontFamily: fontFamily.regular, textAlign: "center", marginTop: 24 },
});
