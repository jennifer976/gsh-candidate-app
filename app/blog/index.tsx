import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchPublishedBlogList } from "@/lib/content/blogQueries";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function BlogIndexScreen() {
  const router = useRouter();
  const q = useQuery({ queryKey: ["blogs", "published"], queryFn: fetchPublishedBlogList, staleTime: 120_000 });

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {q.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : q.data?.length === 0 ? (
          <ScrollView contentContainerStyle={styles.pad}>
            <Text style={styles.emptyTitle}>Blog unavailable</Text>
            <Text style={styles.emptyBody}>
              Connect Supabase for published posts: set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (same
              project as the website CMS). Articles then load here — still no browser required.
            </Text>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
            <Text style={styles.lead}>Editorial posts from the Global Sponsor Hub CMS — rendered natively.</Text>
            {q.data?.map((b) => (
              <Pressable
                key={b.id}
                style={[styles.card, cardSurfaceStyle(true)]}
                onPress={() => router.push(`/blog/${encodeURIComponent(b.slug)}`)}
                accessibilityRole="button"
              >
                {b.featured_image ? (
                  <Image source={{ uri: b.featured_image }} style={styles.thumb} accessibilityIgnoresInvertColors />
                ) : null}
                <Text style={styles.eyebrow}>{b.category?.name ?? "Article"}</Text>
                <Text style={styles.title}>{b.title}</Text>
                {b.description ? (
                  <Text style={styles.desc} numberOfLines={3}>
                    {b.description}
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  pad: { padding: 16, paddingBottom: 40, gap: 14 },
  lead: { fontSize: 15, color: colors.textMuted, fontFamily: fontFamily.regular, lineHeight: 22, marginBottom: 8 },
  card: { padding: 16, borderRadius: radii.md },
  thumb: { width: "100%", height: 160, borderRadius: radii.sm, marginBottom: 12, resizeMode: "cover" },
  eyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.teal,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  title: { fontSize: 18, fontFamily: fontFamily.bold, color: colors.textPrimary, letterSpacing: -0.2 },
  desc: { marginTop: 8, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 20 },
  emptyTitle: { fontSize: 18, fontFamily: fontFamily.bold, color: colors.textPrimary, marginBottom: 10 },
  emptyBody: { fontSize: 15, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 22 },
});
