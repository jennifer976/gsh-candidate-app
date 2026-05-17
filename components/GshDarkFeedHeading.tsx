import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontFamily } from "@/lib/theme";

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** First heading below native header — use with stackFlatListHeadWrap / stackScrollContentStyle */
  pageLead?: boolean;
  /** Inside a parent with gap (e.g. Home activity panel) — no extra top inset */
  inFeedGroup?: boolean;
};

/** Section heading on navy feed canvas — matches Jobs tab list headings. */
export function GshDarkFeedHeading({
  title,
  subtitle,
  actionLabel,
  onAction,
  pageLead,
  inFeedGroup,
}: Props) {
  return (
    <View style={[styles.row, pageLead && styles.rowPageLead, inFeedGroup && styles.rowInFeedGroup]}>
      <View style={styles.col}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: 18,
    paddingBottom: 10,
    gap: 8,
  },
  rowPageLead: {
    paddingTop: 0,
    paddingBottom: 12,
  },
  rowInFeedGroup: {
    paddingTop: 0,
    paddingBottom: 6,
  },
  col: { flex: 1, minWidth: 0 },
  title: {
    fontSize: 19,
    fontFamily: fontFamily.extraBold,
    color: colors.white,
    letterSpacing: -0.4,
  },
  sub: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 17,
  },
  action: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.teal },
});
