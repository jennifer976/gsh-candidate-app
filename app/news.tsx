import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchImmigrationRssHeadlines } from "@/lib/content/rssImmigration";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function ImmigrationNewsScreen() {
  const q = useQuery({
    queryKey: ["rss", "immigration-headlines"],
    queryFn: fetchImmigrationRssHeadlines,
    staleTime: 3600_000,
    retry: 1,
  });

  const headlines = q.data ?? [];

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.pad}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={q.isFetching && !q.isLoading}
              onRefresh={() => void q.refetch()}
              tintColor={colors.brand}
            />
          }
        >
          <GshScreenIntro
            eyebrow="News"
            title="Immigration headlines"
            subtitle="Headlines from third‑party publishers (government agencies, NGOs, and analysts). Tapping a row opens the article in a sheet inside this app."
            style={{ marginBottom: 12 }}
          />
          <LinearGradient colors={[colors.teal, colors.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accentBar} />

          {q.isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.brand} />
              <Text style={styles.loadingHint}>Fetching headlines from immigration publishers…</Text>
            </View>
          ) : q.isError ? (
            <View style={styles.center}>
              <Ionicons name="cloud-offline-outline" size={44} color={colors.textMuted} />
              <Text style={styles.errTitle}>Headlines could not be loaded</Text>
              <Text style={styles.errSub}>Check your connection and pull down to retry.</Text>
              <Pressable style={styles.retryBtn} onPress={() => void q.refetch()} accessibilityRole="button">
                <Text style={styles.retryBtnText}>Try again</Text>
              </Pressable>
            </View>
          ) : headlines.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="newspaper-outline" size={44} color={colors.textMuted} />
              <Text style={styles.empty}>No matching headlines right now.</Text>
              <Text style={styles.errSub}>Pull down to refresh — feeds are filtered to visa and work-mobility topics.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.countLine}>{headlines.length} headline{headlines.length === 1 ? "" : "s"}</Text>
              {headlines.map((h, i) => (
                <Pressable
                  key={`${h.link}-${i}`}
                  style={[styles.row, cardSurfaceStyle(true)]}
                  onPress={() => {
                    try {
                      openExternalUrlInApp(h.link);
                    } catch {
                      /* invalid link in feed */
                    }
                  }}
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
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, paddingBottom: 40, gap: 12, flexGrow: 1 },
  center: { alignItems: "center", paddingVertical: 32, gap: 10 },
  accentBar: { height: 4, borderRadius: 2, marginBottom: 8 },
  loadingHint: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  countLine: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: radii.md,
  },
  source: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.teal, letterSpacing: 0.2 },
  title: { marginTop: 6, fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.navy, lineHeight: 22 },
  date: { marginTop: 6, fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted },
  open: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.brand },
  empty: { fontSize: 16, color: colors.navy, fontFamily: fontFamily.semiBold, textAlign: "center" },
  errTitle: { fontFamily: fontFamily.semiBold, fontSize: 17, color: colors.navy, textAlign: "center" },
  errSub: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  retryBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
  },
  retryBtnText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.white },
});
