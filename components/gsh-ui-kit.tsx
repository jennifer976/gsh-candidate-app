import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { BrandChip, DepthButton, Eyebrow } from "@/components/gsh-brand";
import { GshPressable } from "@/components/GshPressable";
import { STACK_HEADER_BODY_GAP } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

export type GshLinkAccent = "teal" | "purple" | "ocean";

const ACCENT: Record<GshLinkAccent, { wrap: string; icon: string }> = {
  teal: { wrap: colors.cyan, icon: colors.navy },
  purple: { wrap: colors.cyan, icon: colors.navy },
  ocean: { wrap: colors.cyan, icon: colors.navy },
};

export function GshScreenIntro({
  eyebrow,
  title,
  subtitle,
  style,
  underStackHeader,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  style?: ViewStyle;
  /** Extra top inset when this intro sits directly under a native header (FlatList header, etc.) */
  underStackHeader?: boolean;
}) {
  return (
    <View style={[introStyles.wrap, underStackHeader && introStyles.underStack, style]}>
      {eyebrow && eyebrow !== title ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Text style={introStyles.title}>{title}</Text>
      {subtitle ? <Text style={introStyles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const introStyles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  underStack: { paddingTop: STACK_HEADER_BODY_GAP },
  title: {
    marginTop: 4,
    fontSize: 30,
    lineHeight: 34,
    fontFamily: fontFamily.headingStrong,
    color: colors.navy,
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export function GshSectionTitle({
  title,
  hint,
  actionLabel,
  onAction,
  topSpacing = "md",
  onDark = false,
  style,
}: {
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
  topSpacing?: "none" | "sm" | "md" | "lg";
  /** Light text for navy canvas sections (Home, Jobs list). */
  onDark?: boolean;
  style?: ViewStyle;
}) {
  const mt = topSpacing === "none" ? 0 : topSpacing === "sm" ? 8 : topSpacing === "lg" ? 28 : 18;
  return (
    <View style={[{ marginTop: mt, marginBottom: hint || actionLabel ? 8 : 10 }, style]}>
      <View style={secStyles.titleRow}>
        <View style={secStyles.rule} />
        <Text style={[secStyles.title, onDark && secStyles.titleOnDark]}>{title}</Text>
        {actionLabel && onAction ? (
          <Pressable style={secStyles.actionHit} onPress={onAction} hitSlop={10} accessibilityRole="button">
            <Text style={[secStyles.action, onDark && secStyles.actionOnDark]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {hint ? <Text style={[secStyles.hint, onDark && secStyles.hintOnDark]}>{hint}</Text> : null}
    </View>
  );
}

const secStyles = StyleSheet.create({
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  rule: { width: 4, height: 20, borderRadius: 2, backgroundColor: colors.teal },
  title: {
    flex: 1,
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.3,
  },
  titleOnDark: { color: colors.white },
  actionHit: { minHeight: 44, justifyContent: "center" },
  action: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.brand },
  actionOnDark: { color: colors.teal },
  hint: {
    marginTop: 6,
    marginLeft: 14,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 20,
  },
  hintOnDark: { color: "rgba(255,255,255,0.55)" },
});

export function GshLinkRow({
  title,
  subtitle,
  icon,
  accent,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: IonName;
  accent: GshLinkAccent;
  onPress: () => void;
}) {
  const pal = ACCENT[accent];
  return (
    <GshPressable
      style={[rowStyles.row, cardSurfaceStyle(true)]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={[rowStyles.iconTile, { backgroundColor: pal.wrap }]}>
        <Ionicons name={icon} size={24} color={pal.icon} />
      </View>
      <View style={rowStyles.textCol}>
        <Text style={rowStyles.rowTitle}>{title}</Text>
        <Text style={rowStyles.rowSub}>{subtitle}</Text>
      </View>
      <View style={rowStyles.chev}>
        <Ionicons name="chevron-forward" size={20} color={colors.navy} />
      </View>
    </GshPressable>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: 16, fontFamily: fontFamily.heading, color: colors.navy, letterSpacing: -0.2 },
  rowSub: { marginTop: 4, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textSecondary, lineHeight: 20 },
  chev: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
});

export function GshNavyHeroCard({
  badge = "Global Sponsor Hub",
  title,
  children,
  footer,
}: {
  badge?: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <View style={heroStyles.card}>
      <View style={heroStyles.badge}>
        <Text style={heroStyles.badgeText}>{badge}</Text>
      </View>
      <Text style={heroStyles.title}>{title}</Text>
      {typeof children === "string" ? <Text style={heroStyles.body}>{children}</Text> : <View>{children}</View>}
      {footer ? <View style={heroStyles.footer}>{footer}</View> : null}
    </View>
  );
}

const heroStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.navy,
    padding: 22,
    marginBottom: 8,
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 0.6,
    textTransform: "lowercase",
  },
  title: {
    fontSize: 26,
    fontFamily: fontFamily.headingStrong,
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.88)",
    lineHeight: 23,
  },
  footer: { marginTop: 16 },
});

export function GshMessengerTip({ children }: { children: string }) {
  return (
    <View style={tipStyles.wrap}>
      <View style={tipStyles.inner}>
        <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.navy} />
        <Text style={tipStyles.text}>{children}</Text>
      </View>
    </View>
  );
}

const tipStyles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    marginBottom: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
  },
  inner: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16 },
  text: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 21,
  },
});

export function GshCompletionStrip({ pct }: { pct: number | null }) {
  if (pct == null) return null;
  const w = Math.min(100, Math.max(0, pct));
  return (
    <View style={[stripStyles.card, cardSurfaceStyle(false)]}>
      <Text style={stripStyles.label}>Profile completion</Text>
      <View style={stripStyles.row}>
        <Text style={stripStyles.pct}>{pct}%</Text>
        <Text style={stripStyles.hint}>{pct >= 100 ? "Great work" : "Strong profiles get more replies"}</Text>
      </View>
      <View style={stripStyles.track}>
        <View style={[stripStyles.fill, { width: `${w}%` }]} />
      </View>
    </View>
  );
}

const stripStyles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: radii.lg,
    marginBottom: 18,
  },
  label: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.textSecondary, letterSpacing: 0.3 },
  row: { flexDirection: "row", alignItems: "baseline", gap: 10, marginTop: 6 },
  pct: { fontSize: 28, fontFamily: fontFamily.headingStrong, color: colors.brand, letterSpacing: -0.5 },
  hint: { flex: 1, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 18 },
  track: {
    marginTop: 12,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  fill: { height: "100%", borderRadius: radii.pill, backgroundColor: colors.teal },
});

/** Teal → brand rule used on blog, legal, and content tool screens. */
export function GshContentAccentBar({ style }: { style?: ViewStyle }) {
  return <View style={[{ height: 3, backgroundColor: colors.teal, marginBottom: 12 }, style]} />;
}

export function GshOutlineButton({
  title,
  onPress,
  style,
}: {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return <DepthButton title={title} onPress={onPress} variant="white" bordered size="md" icon={null} style={style} />;
}

export function GshFilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return <BrandChip label={label} selected={active} onPress={onPress} />;
}

/** Destination / expert name chips on light content screens. */
export function GshTopicChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      style={[cardSurfaceStyle(true), topicChipStyles.chip]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={topicChipStyles.text}>{label}</Text>
    </Pressable>
  );
}

const topicChipStyles = StyleSheet.create({
  chip: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderBottomWidth: 2,
  },
  text: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.navy },
});
