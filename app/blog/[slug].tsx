import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlogArticleBody } from "@/components/BlogArticleBody";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchBlogArticleBySlug, SupabaseNotConfiguredError } from "@/lib/content/blogQueries";
import { openWebsitePath } from "@/lib/openWebsite";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function BlogArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const raw = typeof slug === "string" ? slug : "";
  const decoded = decodeURIComponent(raw);

  const q = useQuery({
    queryKey: ["blog", decoded],
    queryFn: () => fetchBlogArticleBySlug(decoded),
    enabled: decoded.length > 0,
    retry: (count, err) => {
      if (err instanceof SupabaseNotConfiguredError) return false;
      return count < 2;
    },
  });

  function openThisArticleOnWeb() {
    void openWebsitePath(`/blog/${encodeURIComponent(decoded)}`);
  }

  if (q.isLoading) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.center} edges={["bottom"]}>
          <ActivityIndicator size="large" color={colors.brand} />
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  if (q.isError) {
    const notConfigured = q.error instanceof SupabaseNotConfiguredError;
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.center} edges={["bottom"]}>
          <GshScreenIntro
            title={notConfigured ? "Article unavailable in-app" : "Could not load this article"}
            subtitle={
              notConfigured ? "Open this piece on our website instead." : "Check your connection or try again on the website."
            }
            style={{ marginBottom: 8 }}
          />
          <Pressable style={styles.primaryOutline} onPress={openThisArticleOnWeb} accessibilityRole="button">
            <Text style={styles.linkStrong}>Open on website</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.link}>Go back</Text>
          </Pressable>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  if (!q.data) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.center} edges={["bottom"]}>
          <GshScreenIntro title="We could not find that article." style={{ marginBottom: 8 }} />
          <Pressable style={styles.primaryOutline} onPress={openThisArticleOnWeb} accessibilityRole="button">
            <Text style={styles.linkStrong}>Try on website</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.link}>Go back</Text>
          </Pressable>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  const { blog, sections } = q.data;

  return (
    <GshScreenBackground>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <View style={[styles.hero, cardSurfaceStyle(true)]}>
            {blog.featured_image ? (
              <Image source={{ uri: blog.featured_image }} style={styles.heroImg} accessibilityIgnoresInvertColors />
            ) : null}
            <LinearGradient colors={[colors.teal, colors.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accentBar} />
            <Text style={styles.eyebrow}>{blog.category?.name ?? "Blog"}</Text>
            <Text style={styles.title}>{blog.title}</Text>
            {blog.description ? <Text style={styles.desc}>{blog.description}</Text> : null}
          </View>
          <BlogArticleBody sections={sections} />
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  pad: { padding: 16, paddingBottom: 48 },
  hero: { padding: 16, borderRadius: radii.lg, marginBottom: 16 },
  heroImg: { width: "100%", height: 200, borderRadius: radii.sm, marginBottom: 14, resizeMode: "cover" },
  accentBar: { height: 4, borderRadius: 2, marginBottom: 12 },
  eyebrow: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.teal,
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  title: { fontSize: 24, fontFamily: fontFamily.extraBold, color: colors.navy, letterSpacing: -0.35 },
  desc: { marginTop: 10, fontSize: 15, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 22 },
  link: { fontFamily: fontFamily.semiBold, fontSize: 16, color: colors.brand },
  linkStrong: { fontFamily: fontFamily.semiBold, fontSize: 16, color: colors.brand },
  primaryOutline: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: radii.sm,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
});
