import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlogArticleBody } from "@/components/BlogArticleBody";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenShell } from "@/components/GshScreenShell";
import { SupabaseNotConfiguredError } from "@/lib/content/blogQueries";
import { fetchExpertInsightBySlug } from "@/lib/content/expertInsightQueries";
import { useAppCopy } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { colors, fontFamily, radii } from "@/lib/theme";

export default function ExpertArticleScreen() {
  const ac = useAccountCopy();
  const { intlLocale } = useAppCopy();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const key = typeof slug === "string" ? slug : "";

  const q = useQuery({
    queryKey: ["expert-insight", key],
    queryFn: () => fetchExpertInsightBySlug(key),
    enabled: key.length > 0,
    retry: (count, error) => !(error instanceof SupabaseNotConfiguredError) && count < 2,
  });

  if (q.isLoading) {
    return (
      <GshScreenShell>
        <SafeAreaView style={styles.center} edges={["bottom"]}>
          <ActivityIndicator size="large" color={colors.navy} />
        </SafeAreaView>
      </GshScreenShell>
    );
  }

  if (!q.data) {
    const failed = q.isError && !(q.error instanceof SupabaseNotConfiguredError);
    return (
      <GshScreenShell>
        <SafeAreaView style={styles.center} edges={["bottom"]}>
          <GshScreenIntro
            title={failed ? ac("Could not load this article") : ac("Article unavailable")}
            subtitle={failed ? ac("Check your connection and try again.") : undefined}
          />
          {failed ? (
            <Pressable style={styles.button} onPress={() => void q.refetch()} accessibilityRole="button">
              <Text style={styles.buttonText}>{ac("Try again")}</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.button} onPress={() => router.replace("/resources")} accessibilityRole="button">
            <Text style={styles.buttonText}>{ac("Back to resources")}</Text>
          </Pressable>
        </SafeAreaView>
      </GshScreenShell>
    );
  }

  const { insight, contributor, sections } = q.data;
  const published = new Date(insight.publishedAt).toLocaleDateString(intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <GshScreenShell constrainTabletWidth>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>{ac("Expert insight")}</Text>
          <Text style={styles.title} accessibilityRole="header">
            {insight.title}
          </Text>
          {insight.excerpt ? <Text style={styles.intro}>{insight.excerpt}</Text> : null}
          <Text style={styles.meta}>
            {[published, insight.readMinutes ? ac("{count} min read", { count: insight.readMinutes }) : null]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          <View style={styles.author}>
            <Text style={styles.authorName}>{contributor.name}</Text>
            {contributor.role ? <Text style={styles.authorRole}>{contributor.role}</Text> : null}
            {contributor.bio ? <Text style={styles.authorBio}>{contributor.bio}</Text> : null}
          </View>
          <BlogArticleBody sections={sections} />
        </ScrollView>
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  pad: { ...stackScrollContentStyle, gap: 12, paddingBottom: 48 },
  eyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.navy,
    opacity: 0.6,
  },
  title: { fontSize: 27, lineHeight: 31, fontFamily: fontFamily.headingStrong, color: colors.navy, letterSpacing: -0.7 },
  intro: { fontSize: 15, lineHeight: 22, fontFamily: fontFamily.regular, color: colors.textSecondary },
  meta: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.textMuted },
  author: {
    gap: 4,
    padding: 16,
    marginBottom: 8,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.pale,
  },
  authorName: { fontSize: 16, fontFamily: fontFamily.heading, color: colors.navy },
  authorRole: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textSecondary },
  authorBio: { marginTop: 4, fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular, color: colors.textMarketing },
  button: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 22,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.navy,
  },
  buttonText: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.navy },
});
