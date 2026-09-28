import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenShell } from "@/components/GshScreenShell";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { getCandidateTemplate, type TemplateBlock, type TemplateSection } from "@/lib/publicResources";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { colors, fontFamily, radii } from "@/lib/theme";
import { useTemplateSaves } from "@/lib/useTemplateSaves";

function plainText(title: string, sections: TemplateSection[]) {
  const blockText = (block: TemplateBlock) => {
    if (block.type === "prose") return block.body;
    if (block.type === "callout") return block.callout.body;
    if (block.type === "table") return block.table.rows.map((row) => `- ${row.join(" | ")}`).join("\n");
    return block.items.map((item) => `- ${item.text}`).join("\n");
  };
  return [title, ...sections.map((section) => [section.heading, ...section.blocks.map(blockText)].join("\n"))].join(
    "\n\n",
  );
}

function Block({ block }: { block: TemplateBlock }) {
  const ac = useAccountCopy();
  switch (block.type) {
    case "prose":
      return <Text style={styles.body}>{ac(block.body)}</Text>;
    case "callout": {
      const warning = block.callout.variant === "warning";
      return (
        <View style={[styles.callout, warning && styles.calloutWarning]} accessibilityRole="summary">
          <View style={styles.calloutHead}>
            <Ionicons name={warning ? "warning-outline" : "copy-outline"} size={16} color={colors.navy} />
            <Text style={styles.calloutTitle}>{ac(block.callout.title)}</Text>
          </View>
          {block.callout.body.split(/\n{2,}/).map((paragraph) => (
            <Text key={paragraph} style={styles.calloutBody} selectable>
              {ac(paragraph)}
            </Text>
          ))}
        </View>
      );
    }
    case "checklist":
      return (
        <View style={styles.list}>
          {block.items.map((item) => (
            <View key={item.text} style={styles.listRow}>
              <Ionicons name="checkbox-outline" size={18} color={colors.navy} style={styles.listIcon} />
              <Text style={styles.listText}>{ac(item.text)}</Text>
            </View>
          ))}
        </View>
      );
    case "steps":
      return (
        <View style={styles.list}>
          {block.items.map((item, index) => (
            <View key={item.text} style={styles.listRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.listText}>{ac(item.text)}</Text>
            </View>
          ))}
        </View>
      );
    case "bullets":
      return (
        <View style={styles.list}>
          {block.title ? <Text style={styles.listTitle}>{ac(block.title)}</Text> : null}
          {block.items.map((item) => (
            <View key={item.text} style={styles.listRow}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{ac(item.text)}</Text>
            </View>
          ))}
        </View>
      );
    case "table":
      return (
        <View style={styles.table} accessibilityLabel={ac(block.table.caption)}>
          <Text style={styles.tableHead}>{ac(block.table.columns[0] ?? "")}</Text>
          {block.table.rows.map((row, index) => (
            <Text key={row.join("|")} style={[styles.tableCell, index % 2 === 1 && styles.tableCellAlt]}>
              {ac(row.join(" · "))}
            </Text>
          ))}
        </View>
      );
  }
}

export default function CandidateTemplateScreen() {
  const ac = useAccountCopy();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const template = getCandidateTemplate(String(slug ?? ""));
  const saves = useTemplateSaves(`/resources/${slug ?? ""}`);
  const [status, setStatus] = useState("");

  if (!template) {
    return (
      <GshScreenShell>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <View style={styles.empty}>
            <GshScreenIntro title={ac("Resource not found")} subtitle={ac("Try a broader question or return to the complete library.")} />
            <Pressable style={styles.secondary} onPress={() => router.replace("/resources")} accessibilityRole="button">
              <Text style={styles.secondaryText}>{ac("Back to resources")}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </GshScreenShell>
    );
  }

  const format = template.format ?? "Resource";
  const saved = saves.isSaved(template.slug);
  const isMove = template.category === "Relocation";
  const next: { body: string; primary: [string, Href]; secondary: [string, Href] } = isMove
    ? {
        body: "Plan the costs and practical steps for your move. Browse independent specialists if you need help.",
        primary: ["Plan your move costs", "/relocation-worksheets"],
        secondary: ["Browse specialists", "/partners"],
      }
    : {
        body: "Compare roles and confirm the hiring details with the employer before you apply.",
        primary: ["Browse international jobs", "/(tabs)/jobs"],
        secondary: ["Track your applications", "/application-tracker"],
      };

  async function copyTemplate() {
    try {
      await Clipboard.setStringAsync(plainText(template!.title, template!.sections));
      setStatus(ac("Template copied to clipboard."));
    } catch {
      setStatus(ac("Copy failed. Select the template text and copy it manually."));
    }
  }

  return (
    <GshScreenShell constrainTabletWidth>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>{ac(template.category)}</Text>
          <Text style={styles.title} accessibilityRole="header">
            {ac(template.title)}
          </Text>
          <Text style={styles.intro}>{ac(template.description)}</Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="document-text-outline" size={16} color={colors.navy} />
              <Text style={styles.metaText}>{ac(format)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={colors.navy} />
              <Text style={styles.metaText}>
                {ac("About {count} minutes", { count: template.estimatedMinutes ?? 10 })}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="list-outline" size={16} color={colors.navy} />
              <Text style={styles.metaText}>
                {ac("{count} focused sections", { count: template.sections.length })}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            {format === "Template" ? (
              <Pressable style={styles.primary} onPress={copyTemplate} accessibilityRole="button">
                <Ionicons name="copy-outline" size={18} color={colors.navy} />
                <Text style={styles.primaryText}>{ac("Copy clean template")}</Text>
              </Pressable>
            ) : null}
            {format === "Tracker" ? (
              <Pressable
                style={styles.primary}
                onPress={() => router.push("/application-tracker")}
                accessibilityRole="button"
              >
                <Ionicons name="list-outline" size={18} color={colors.navy} />
                <Text style={styles.primaryText}>{ac("Open application tracker")}</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={styles.secondary}
              onPress={() => saves.toggle(template.slug, template.title)}
              disabled={saves.busy}
              accessibilityRole="button"
              accessibilityState={{ selected: saved }}
            >
              <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={18} color={colors.navy} />
              <Text style={styles.secondaryText}>{saved ? ac("Saved") : ac("Save resource")}</Text>
            </Pressable>
          </View>
          {status || saves.failed ? (
            <Text style={styles.status} accessibilityLiveRegion="polite">
              {saves.failed ? `${ac("Could not update resources")}. ${ac("Please try again.")}` : status}
            </Text>
          ) : null}

          <View style={styles.useNow} accessibilityRole="summary">
            <Text style={styles.useNowText}>
              <Text style={styles.useNowLabel}>{ac("Use it now:")} </Text>
              {ac(template.cta)}
            </Text>
          </View>

          {template.sections.map((section, index) => (
            <View key={section.heading} style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionNumber}>{String(index + 1).padStart(2, "0")}</Text>
                <Text style={styles.sectionTitle} accessibilityRole="header">
                  {ac(section.heading)}
                </Text>
              </View>
              {section.blocks.map((block, blockIndex) => (
                <Block key={`${section.heading}-${blockIndex}`} block={block} />
              ))}
            </View>
          ))}

          <View style={styles.next}>
            <Text style={styles.nextEyebrow}>{ac("Next step")}</Text>
            <Text style={styles.nextTitle} accessibilityRole="header">
              {ac("Put the resource to work")}
            </Text>
            <Text style={styles.nextBody}>{ac(next.body)}</Text>
            <Pressable style={styles.nextPrimary} onPress={() => router.push(next.primary[1])} accessibilityRole="button">
              <Text style={styles.nextPrimaryText}>{ac(next.primary[0])}</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.navy} />
            </Pressable>
            <Pressable style={styles.nextSecondary} onPress={() => router.push(next.secondary[1])} accessibilityRole="button">
              <Text style={styles.nextSecondaryText}>{ac(next.secondary[0])}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, gap: 14, paddingBottom: 48 },
  empty: { ...stackScrollContentStyle, gap: 16 },
  eyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.navy,
    opacity: 0.6,
  },
  title: { fontSize: 28, lineHeight: 32, fontFamily: fontFamily.headingStrong, color: colors.navy, letterSpacing: -0.8 },
  intro: { fontSize: 15, lineHeight: 22, fontFamily: fontFamily.regular, color: colors.textSecondary },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.textSecondary },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  primary: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.teal,
  },
  primaryText: { fontSize: 14, fontFamily: fontFamily.bold, color: colors.navy },
  secondary: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.white,
  },
  secondaryText: { fontSize: 14, fontFamily: fontFamily.bold, color: colors.navy },
  status: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textSecondary },
  useNow: { borderLeftWidth: 3, borderLeftColor: colors.teal, paddingVertical: 10, paddingHorizontal: 14 },
  useNowText: { fontSize: 14, lineHeight: 21, fontFamily: fontFamily.regular, color: colors.textMarketing },
  useNowLabel: { fontFamily: fontFamily.bold, color: colors.navy },
  section: { gap: 10, paddingTop: 18, borderTopWidth: 1, borderTopColor: colors.border },
  sectionHead: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  sectionNumber: { fontSize: 13, fontFamily: fontFamily.headingStrong, color: colors.navy, opacity: 0.45 },
  sectionTitle: { flex: 1, fontSize: 19, lineHeight: 24, fontFamily: fontFamily.heading, color: colors.navy },
  body: { fontSize: 15, lineHeight: 23, fontFamily: fontFamily.regular, color: colors.textMarketing },
  callout: {
    gap: 8,
    padding: 16,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.pale,
  },
  calloutWarning: { borderColor: colors.error, backgroundColor: colors.white },
  calloutHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  calloutTitle: { fontSize: 13, fontFamily: fontFamily.bold, color: colors.navy, textTransform: "uppercase", letterSpacing: 0.8 },
  calloutBody: { fontSize: 15, lineHeight: 23, fontFamily: fontFamily.regular, color: colors.navy },
  list: { gap: 10 },
  listTitle: { fontSize: 14, fontFamily: fontFamily.bold, color: colors.navy },
  listRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  listIcon: { marginTop: 2 },
  listText: { flex: 1, fontSize: 15, lineHeight: 22, fontFamily: fontFamily.regular, color: colors.textMarketing },
  bullet: { width: 7, height: 7, marginTop: 8, borderRadius: 4, backgroundColor: colors.teal },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.navy,
  },
  stepNumberText: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.teal },
  table: { borderRadius: radii.md, borderWidth: 2, borderColor: colors.navy, overflow: "hidden" },
  tableHead: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.navy,
    color: colors.white,
    fontSize: 12,
    fontFamily: fontFamily.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tableCell: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
    backgroundColor: colors.white,
  },
  tableCellAlt: { backgroundColor: colors.pale },
  next: { marginTop: 12, gap: 10, padding: 20, borderRadius: radii.xl, backgroundColor: colors.navy },
  nextEyebrow: { fontSize: 11, fontFamily: fontFamily.bold, letterSpacing: 1.6, textTransform: "uppercase", color: colors.teal },
  nextTitle: { fontSize: 21, fontFamily: fontFamily.headingStrong, color: colors.white },
  nextBody: { fontSize: 14, lineHeight: 21, fontFamily: fontFamily.regular, color: "rgba(255,255,255,0.82)" },
  nextPrimary: {
    marginTop: 6,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.teal,
  },
  nextPrimaryText: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.navy },
  nextSecondary: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  nextSecondaryText: { fontSize: 14, fontFamily: fontFamily.bold, color: colors.white },
});
