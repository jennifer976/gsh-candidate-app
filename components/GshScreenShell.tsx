import type { ReactNode } from "react";
import { StyleSheet, useWindowDimensions, View, type ViewStyle } from "react-native";
import { TABLET_BREAKPOINT_WIDTH, TABLET_MAX_CONTENT_WIDTH } from "@/lib/screen-layout";
import { colors } from "@/lib/theme";

type Props = {
  children: ReactNode;
  variant?: "dark" | "light";
  style?: ViewStyle;
  /** When true, caps content width on tablets (recommended for scroll feeds). */
  constrainTabletWidth?: boolean;
};

/**
 * App screen canvas — dark matches marketing navy bands; light for dense forms.
 */
export function GshScreenShell({
  children,
  variant = "dark",
  style,
  constrainTabletWidth = false,
}: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= TABLET_BREAKPOINT_WIDTH;

  return (
    <View style={[styles.root, variant === "dark" ? styles.dark : styles.light, style]}>
      <View
        style={[
          styles.inner,
          constrainTabletWidth && isWide && styles.innerWide,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1 },
  innerWide: {
    width: "100%",
    maxWidth: TABLET_MAX_CONTENT_WIDTH,
    alignSelf: "center",
  },
  dark: { backgroundColor: colors.navyDeep },
  light: { backgroundColor: colors.surfaceLight },
});
