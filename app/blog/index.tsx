import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchPublishedBlogList, SupabaseNotConfiguredError } from "@/lib/content/blogQueries";
import { openWebsitePath } from "@/lib/openWebsite";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function BlogIndexScreen() {
  const router = useRouter();
  const q = useQuery({
    queryKey: ["blogs", "published"],
    queryFn: fetchPublishedBlogList,
    staleTime: 120_000,
    retry: (count, err) => {
      if (err instanceof SupabaseNotConfiguredError) return false;
      return count < 2;
    },
  });

  function openWebBlog() {
    void openWebsitePath("/blog");
  }

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {q.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : q.isError ? (
          <ScrollView contentContainerStyle={styles.pad}>
            <Text style={styles.emptyTitle}>
              {q.error instanceof SupabaseNotConfiguredError ? "Blog not linked yet" : "Could not load articles"}
            </Text>
            <Text style={styles.emptyBody}>
              {q.error instanceof SupabaseNotConfiguredError
                ? "Articles come from the same place as our website. This install has not been linked to that service yet — you can read every post on globalsponsorhub.com."
                : "Check your connection, then try again or open the blog on our website."}
            </Text>
            <Pressable style={[styles.primaryOutline, cardSurfaceStyle(false)]} onPress={openWebBlog} accessibilityRole="button">
              <Text style={styles.primaryOutlineText}>Open blog on website</Text>
            </Pressable>
          </ScrollView>
        ) : q.data?.length === 0 ? (
          <ScrollView contentContainerStyle={styles.pad}>
            <Text style={styles.emptyTitle}>No articles to show</Text>
            <Text style={styles.emptyBody}>
              Nothing is published here at the moment. You may find posts on the website.
            </Text>
            <Pressable style={[styles.primaryOutline, cardSurfaceStyle(false)]} onPress={openWebBlog} accessibilityRole="button">
              <Text style={styles.primaryOutlineText}>Open blog on website</Text>
            </Pressable>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
            <Text style={styles.lead}>Latest articles — same catalogue as globalsponsorhub.com.</Text>
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
  primaryOutline: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: radii.sm,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryOutlineText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.brand },
});
