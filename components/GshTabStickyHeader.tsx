import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontFamily } from "@/lib/theme";

type Props = {
  title: string;
  subtitle?: string;
  paddingTop: number;
  children?: ReactNode;
};

/** Sticky large-title chrome shared by Jobs / Applications / Messages / Profile. */
export function GshTabStickyHeader({
  title,
  subtitle,
  paddingTop,
  children,
}: Props) {
  return (
    <View style={[styles.chrome, { paddingTop }]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  chrome: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.pale,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: fontFamily.headingStrong,
    color: colors.navy,
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
