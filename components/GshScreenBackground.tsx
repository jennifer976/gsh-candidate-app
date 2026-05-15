import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { colors } from "@/lib/theme";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

/**
 * Standard light screen background — white, matching the website.
 * Navy is reserved for hero sections only (Discover, Guides).
 */
export function GshScreenBackground({ children, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceLight },
});
