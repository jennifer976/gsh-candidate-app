import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlogArticleBody } from "@/components/BlogArticleBody";
import { ContentComingSoonCard } from "@/components/ContentComingSoonCard";
import { BrandLinkRow, BrandStatePanel } from "@/components/gsh-brand";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { isSupabaseNotConfigured } from "@/lib/content/contentAvailability";
import { fetchBlogArticleBySlug, SupabaseNotConfiguredError } from "@/lib/content/blogQueries";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { colors, fontFamily, radii } from "@/lib/theme";

export default function BlogArticleScreen() {
  const ac = useAccountCopy();

  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const raw = typeof slug === "string" ? slug : "";
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    /* Treat malformed encoding as an unmatched slug. */
  }

  const q = useQuery({
    queryKey: ["blog", decoded],
    queryFn: () => fetchBlogArticleBySlug(decoded),
    enabled: decoded.length > 0,
    retry: (count, err) => {
      if (err instanceof SupabaseNotConfiguredError) return false;
      return count < 2;
    },
  });

  if (q.isLoading) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.center} edges={["bottom"]}>
          <ActivityIndicator size="large" color={colors.navy} />
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  if (q.isError && isSupabaseNotConfigured(q.error)) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <ScrollView contentContainerStyle={[styles.pad, styles.gap]}>
            <ContentComingSoonCard feature="blog" state="not-configured" />
            <BrandLinkRow icon="newspaper-outline" label={ac("Back to blog")} onPress={() => router.push("/blog")} />
          </ScrollView>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  if (q.isError || !q.data) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <ScrollView contentContainerStyle={styles.pad}>
            {q.isError ? (
              <BrandStatePanel
                icon="cloud-offline-outline"
                title={ac("Could not load this article")}
                body={ac("Check your connection and try again.")}
                primary={{ label: ac("Try again"), onPress: () => void q.refetch(), icon: "refresh" }}
                secondary={{ label: ac("All articles"), onPress: () => router.push("/blog"), icon: null }}
              />
            ) : (
              <BrandStatePanel
                icon="document-text-outline"
                title={ac("Article unavailable")}
                body={ac("Choose another article from the blog.")}
                primary={{ label: ac("Back to blog"), onPress: () => router.push("/blog") }}
              />
            )}
          </ScrollView>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  const { blog, sections } = q.data;

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            {blog.featured_image ? (
              <View style={styles.heroFrame}>
                <Image source={{ uri: blog.featured_image }} style={styles.heroImg} accessibilityIgnoresInvertColors />
              </View>
            ) : null}
            <View style={styles.category}>
              <Text style={styles.categoryText} numberOfLines={1}>
                {blog.category?.name ?? ac("Blog")}
              </Text>
            </View>
            <Text style={styles.title} accessibilityRole="header">
              {blog.title}
            </Text>
            <View style={styles.accent} />
            {blog.description ? <Text style={styles.desc}>{blog.description}</Text> : null}
          </View>
          <BlogArticleBody sections={sections} />
          <View style={styles.more}>
            <BrandLinkRow icon="newspaper-outline" label={ac("All articles")} onPress={() => router.push("/blog")} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  pad: { ...stackScrollContentStyle, paddingBottom: 40 },
  gap: { gap: 14 },
  hero: { marginBottom: 12 },
  heroFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: colors.navy,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: colors.pale,
  },
  heroImg: { width: "100%", height: 200, resizeMode: "cover" },
  category: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
    marginBottom: 10,
  },
  categoryText: { fontSize: 11, fontFamily: fontFamily.bold, color: colors.navy, letterSpacing: 0.3 },
  title: {
    fontSize: 30,
    lineHeight: 35,
    fontFamily: fontFamily.headingStrong,
    color: colors.navy,
    letterSpacing: -0.6,
  },
  accent: { width: 56, height: 6, borderRadius: 3, backgroundColor: colors.cyan, marginTop: 12 },
  desc: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  more: { marginTop: 24 },
});
