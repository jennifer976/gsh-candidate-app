import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { colors } from "@/lib/theme";

type Props = {
  children: ReactNode;
  variant?: "dark" | "light";
  style?: ViewStyle;
};

/**
 * App screen canvas — dark matches marketing navy bands; light for dense forms.
 */
export function GshScreenShell({ children, variant = "dark", style }: Props) {
  return (
    <View
      style={[
        styles.root,
        variant === "dark" ? styles.dark : styles.light,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  dark: { backgroundColor: colors.navyDeep },
  light: { backgroundColor: colors.surfaceLight },
});
