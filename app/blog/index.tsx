import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContentComingSoonCard } from "@/components/ContentComingSoonCard";
import { GshContentAccentBar, GshOutlineButton, GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { isSupabaseNotConfigured } from "@/lib/content/contentAvailability";
import { fetchPublishedBlogList, SupabaseNotConfiguredError } from "@/lib/content/blogQueries";
import { stackScrollContentStyle } from "@/lib/screen-layout";
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

  const comingSoon =
    (q.isError && isSupabaseNotConfigured(q.error)) || (!q.isLoading && !q.isError && (q.data?.length ?? 0) === 0);

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {q.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : q.isError && !isSupabaseNotConfigured(q.error) ? (
          <ScrollView contentContainerStyle={styles.pad}>
            <GshScreenIntro
              title="Could not load articles"
              subtitle="Check your connection and try again, or go back to Tools & resources."
              style={{ marginBottom: 16 }}
            />
            <GshOutlineButton title="Try again" onPress={() => void q.refetch()} />
            <GshOutlineButton title="Tools & resources" onPress={() => router.push("/tools-resources")} style={{ marginTop: 10 }} />
          </ScrollView>
        ) : comingSoon ? (
          <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
            <GshScreenIntro
              eyebrow="Blog"
              title="Latest articles"
              subtitle="In-app reading on mobility and careers — no browser required."
              style={{ marginBottom: 10 }}
            />
            <GshContentAccentBar />
            <ContentComingSoonCard
              feature="blog"
              state={q.isError && isSupabaseNotConfigured(q.error) ? "not-configured" : "empty"}
            />
            <GshOutlineButton title="Open guides" onPress={() => router.push("/guides")} style={{ marginTop: 14 }} />
            <GshOutlineButton title="Tools & resources" onPress={() => router.push("/tools-resources")} style={{ marginTop: 10 }} />
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
            <GshScreenIntro eyebrow="Blog" title="Latest articles" subtitle="In-app reading — no browser required." style={{ marginBottom: 10 }} />
            <GshContentAccentBar />
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
  pad: { ...stackScrollContentStyle, paddingBottom: 40, gap: 14 },
  accentBar: { height: 4, borderRadius: 2, marginBottom: 12 },
  card: { padding: 16, borderRadius: radii.lg },
  thumb: { width: "100%", height: 160, borderRadius: radii.sm, marginBottom: 12, resizeMode: "cover" },
  eyebrow: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.teal,
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  title: { fontSize: 18, fontFamily: fontFamily.bold, color: colors.navy, letterSpacing: -0.2 },
  desc: { marginTop: 8, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 20 },
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
