import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlogArticleBody } from "@/components/BlogArticleBody";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchBlogArticleBySlug } from "@/lib/content/blogQueries";
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
  });

  if (q.isLoading) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.center} edges={["bottom"]}>
          <ActivityIndicator size="large" color={colors.brand} />
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  if (!q.data) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.center} edges={["bottom"]}>
          <Text style={styles.err}>Article not found.</Text>
          <Pressable onPress={() => router.back()}>
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
  hero: { padding: 16, borderRadius: radii.md, marginBottom: 16 },
  heroImg: { width: "100%", height: 200, borderRadius: radii.sm, marginBottom: 14, resizeMode: "cover" },
  eyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.teal,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  title: { fontSize: 24, fontFamily: fontFamily.extraBold, color: colors.textPrimary, letterSpacing: -0.35 },
  desc: { marginTop: 10, fontSize: 15, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 22 },
  err: { fontFamily: fontFamily.semiBold, fontSize: 16, color: colors.textPrimary },
  link: { fontFamily: fontFamily.semiBold, fontSize: 16, color: colors.brand },
});
