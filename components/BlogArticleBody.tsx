import * as Linking from "expo-linking";
import { Image, StyleSheet, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import type { BlogSectionRow } from "@/lib/content/blogQueries";
import { colors, fontFamily, radii } from "@/lib/theme";

const mdStyles = StyleSheet.create({
  body: { color: colors.textMarketing, fontFamily: fontFamily.regular },
  heading1: { fontFamily: fontFamily.extraBold, fontSize: 26, color: colors.textPrimary, marginTop: 20 },
  heading2: { fontFamily: fontFamily.bold, fontSize: 22, color: colors.textPrimary, marginTop: 18 },
  heading3: { fontFamily: fontFamily.bold, fontSize: 18, color: colors.textPrimary, marginTop: 14 },
  paragraph: { marginTop: 10, fontSize: 16, lineHeight: 24, fontFamily: fontFamily.regular, color: colors.textMarketing },
  bullet_list: { marginTop: 8 },
  ordered_list: { marginTop: 8 },
  list_item: { marginTop: 4, flexDirection: "row" },
  hr: { marginVertical: 16, backgroundColor: colors.border },
  fence: { marginTop: 12, padding: 12, backgroundColor: colors.surfaceMuted, borderRadius: radii.sm },
  code_inline: { fontFamily: fontFamily.medium, backgroundColor: colors.surfaceMuted, paddingHorizontal: 4 },
  link: { color: colors.brand, textDecorationLine: "underline" },
});

function StructuredSection({ section }: { section: BlogSectionRow }) {
  const { type, content } = section;

  if (type === "paragraph") {
    const text = typeof content.text === "string" ? content.text : "";
    return <Text style={styles.para}>{text}</Text>;
  }

  if (type === "heading") {
    const text = typeof content.text === "string" ? content.text : "";
    const level = content.level === "h3" ? "h3" : "h2";
    return (
      <Text style={level === "h3" ? styles.h3 : styles.h2} accessibilityRole="header">
        {text}
      </Text>
    );
  }

  if (type === "image") {
    const url = typeof content.url === "string" ? content.url : "";
    const alt = typeof content.alt === "string" ? content.alt : "";
    if (!url) return null;
    return <Image source={{ uri: url }} style={styles.img} accessibilityLabel={alt || "Article image"} />;
  }

  if (type === "list") {
    const items = Array.isArray(content.items) ? content.items : [];
    return (
      <View style={styles.listBox}>
        {items.map((item: unknown, i: number) => {
          const row = item as { title?: string; description?: string };
          return (
            <View key={i} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <View style={{ flex: 1 }}>
                {row.title ? <Text style={styles.listTitle}>{row.title}</Text> : null}
                {row.description ? <Text style={styles.listDesc}>{row.description}</Text> : null}
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  if (type === "quote") {
    const text = typeof content.text === "string" ? content.text : "";
    const author = typeof content.author === "string" ? content.author : "";
    return (
      <View style={styles.quote}>
        <Text style={styles.quoteText}>{text}</Text>
        {author ? <Text style={styles.quoteAuthor}>— {author}</Text> : null}
      </View>
    );
  }

  if (type === "cta") {
    const title = typeof content.title === "string" ? content.title : "";
    const description = typeof content.description === "string" ? content.description : "";
    const points = Array.isArray(content.points) ? content.points.filter((p) => typeof p === "string") : [];
    return (
      <View style={styles.cta}>
        {title ? <Text style={styles.ctaTitle}>{title}</Text> : null}
        {description ? <Text style={styles.ctaDesc}>{description}</Text> : null}
        {points.map((p) => (
          <Text key={String(p).slice(0, 40)} style={styles.ctaPoint}>
            • {String(p)}
          </Text>
        ))}
      </View>
    );
  }

  return null;
}

export function BlogArticleBody({ sections }: { sections: BlogSectionRow[] }) {
  const sorted = [...sections].sort((a, b) => a.order_index - b.order_index);

  return (
    <View>
      {sorted.map((section) => {
        if (section.type === "markdown") {
          const source = typeof section.content?.source === "string" ? section.content.source : "";
          if (!source.trim()) return null;
          return (
            <Markdown
              key={section.id}
              style={mdStyles}
              onLinkPress={(url: string) => {
                void Linking.openURL(url);
                return false;
              }}
            >
              {source}
            </Markdown>
          );
        }
        return <StructuredSection key={section.id} section={section} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  para: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
  },
  h2: {
    marginTop: 20,
    fontSize: 22,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  h3: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: fontFamily.semiBold,
    color: colors.textPrimary,
  },
  img: { width: "100%", height: 200, resizeMode: "cover", borderRadius: radii.md, marginTop: 14 },
  listBox: { marginTop: 12, gap: 10 },
  listItem: { flexDirection: "row", gap: 8 },
  bullet: { fontSize: 16, color: colors.accent, fontFamily: fontFamily.bold },
  listTitle: { fontFamily: fontFamily.bold, color: colors.textPrimary },
  listDesc: { marginTop: 4, fontFamily: fontFamily.regular, color: colors.textMarketing, lineHeight: 22 },
  quote: {
    marginTop: 16,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: colors.brand,
    backgroundColor: colors.purpleMuted,
    borderRadius: radii.sm,
  },
  quoteText: { fontSize: 16, fontStyle: "italic", color: colors.textMarketing, lineHeight: 24 },
  quoteAuthor: { marginTop: 8, fontSize: 13, fontFamily: fontFamily.medium, color: colors.textMuted },
  cta: {
    marginTop: 16,
    padding: 16,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  ctaTitle: { fontSize: 18, fontFamily: fontFamily.bold, color: colors.textPrimary },
  ctaDesc: { marginTop: 8, fontSize: 15, color: colors.textMarketing, lineHeight: 22 },
  ctaPoint: { marginTop: 6, fontSize: 15, color: colors.textSecondary },
});
