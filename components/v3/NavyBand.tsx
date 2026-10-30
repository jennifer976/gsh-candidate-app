import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { GshMark } from "@/components/gsh-brand";
import { colors } from "@/lib/theme";

export function NavyBand({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          width: "100%",
          backgroundColor: colors.navy,
          paddingTop: 28,
          paddingHorizontal: 20,
          paddingBottom: 26,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <GshMark
        size={360}
        color="rgba(255,255,255,0.05)"
        style={{
          position: "absolute",
          right: -150,
          top: -90,
        }}
      />
      {children}
    </View>
  );
}
