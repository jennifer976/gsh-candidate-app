import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontFamily } from "@/lib/theme";

type Props = {
  title: string;
  subtitle?: string;
  paddingTop: number;
  children?: ReactNode;
  /** Soft cyan mist behind large titles (Jobs / Apps / Messages). */
  brandWash?: boolean;
};

/** Sticky large-title chrome shared by Jobs / Applications / Messages / Profile. */
export function GshTabStickyHeader({
  title,
  subtitle,
  paddingTop,
  children,
  brandWash = false,
}: Props) {
  const body = (
    <>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </>
  );

  if (brandWash) {
    return (
      <View style={[styles.chrome, styles.chromeWash, { paddingTop }]}>
        {body}
      </View>
    );
  }

  return (
    <View style={[styles.chrome, { paddingTop }]}>
      {body}
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
  chromeWash: {
    backgroundColor: colors.white,
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
