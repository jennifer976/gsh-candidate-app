import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { GshPressable } from "@/components/GshPressable";
import { colors, fontFamily, radii } from "@/lib/theme";

export type ProfileChecklistItem = {
  path: string;
  label: string;
  benefit: string;
  href: string;
};

type Props = {
  title: string;
  subtitle: string;
  items: ProfileChecklistItem[];
  onPressItem: (href: string) => void;
  /** When true, drop outer tint — parent already provides brand wash. */
  embedded?: boolean;
};

/** Glassdoor-style “maximize your profile” checklist — up to 3 actionable rows. */
export function GshHomeProfileChecklist({
  title,
  subtitle,
  items,
  onPressItem,
  embedded = false,
}: Props) {
  if (items.length === 0) return null;

  return (
    <View
      style={[styles.wrap, embedded && styles.wrapEmbedded]}
      accessibilityRole="summary"
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.list}>
        {items.slice(0, 3).map((item, index) => (
          <GshPressable
            key={item.path}
            style={[styles.row, index < Math.min(items.length, 3) - 1 && styles.rowBorder]}
            onPress={() => onPressItem(item.href)}
            accessibilityRole="button"
            accessibilityLabel={`${item.label}. ${item.benefit}`}
            pressScale={0.98}
          >
            <View style={styles.numBadge}>
              <Text style={styles.numText}>{index + 1}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={styles.rowBenefit} numberOfLines={2}>
                {item.benefit}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.navy} />
          </GshPressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.lg,
    backgroundColor: "rgba(66,224,227,0.12)",
    paddingTop: 16,
    paddingBottom: 4,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(66,224,227,0.35)",
  },
  wrapEmbedded: {
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingTop: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamily.headingStrong,
    color: colors.navy,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 10,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  list: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 64,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  numBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  numText: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  copy: { flex: 1, minWidth: 0 },
  rowTitle: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
  },
  rowBenefit: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 16,
  },
});
