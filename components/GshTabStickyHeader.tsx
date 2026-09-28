import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
      <LinearGradient
        colors={["#9aeeee", "#e8fafb", "#f4f7fb"]}
        locations={[0, 0.55, 1]}
        style={[styles.chrome, styles.chromeWash, { paddingTop }]}
      >
        {body}
      </LinearGradient>
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
    backgroundColor: "transparent",
    borderBottomColor: "rgba(66,224,227,0.35)",
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
