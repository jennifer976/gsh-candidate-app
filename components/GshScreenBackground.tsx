import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, type ViewStyle } from "react-native";
import { shellGradient } from "@/lib/theme";

type Props = {
  children: ReactNode;
  /** Extra wrapper style on the gradient root */
  style?: ViewStyle;
};

/** Vertical fade white → muted surface (marketing shell / hero chrome). */
export function GshScreenBackground({ children, style }: Props) {
  return (
    <LinearGradient {...shellGradient} style={[styles.flex, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
