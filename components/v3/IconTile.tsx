import { View, type StyleProp, type ViewStyle } from "react-native";
import { Icon, type IconName } from "@/components/Icon";
import { colors } from "@/lib/theme";

export function IconTile({
  name,
  onNavy = false,
  style,
}: {
  name: IconName;
  onNavy?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          width: 40,
          height: 40,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: onNavy ? "rgba(255,255,255,0.08)" : colors.panel,
        },
        style,
      ]}
    >
      <Icon
        name={name}
        size={20}
        color={onNavy ? colors.cyan : colors.navy}
        strokeWidth={1.8}
      />
    </View>
  );
}
