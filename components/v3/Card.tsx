import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { colors, shadows } from "@/lib/theme";

export function Card({
  children,
  padding = 18,
  style,
}: {
  children: ReactNode;
  padding?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.white,
          borderRadius: 24,
          padding,
          ...shadows.card,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
