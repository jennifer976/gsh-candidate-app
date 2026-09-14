import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/** Soft blue-grey wash matching the website `.header-hero-gradient`. */
export function GshHeroWash({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <LinearGradient
      colors={["#f6f9fc", "#f8fbfd", "#ffffff"]}
      locations={[0, 0.62, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.wash, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wash: {
    width: "100%",
  },
});
