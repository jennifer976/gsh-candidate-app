import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { type IconName } from "@/components/Icon";
import { IconTile } from "@/components/v3/IconTile";
import { colors, fontFamily, shadows } from "@/lib/theme";

export function Tile({
  icon,
  title,
  hint,
  onPress,
  style,
}: {
  icon: IconName;
  title: string;
  hint?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={hint ? `${title}. ${hint}` : title}
      style={[
        {
          backgroundColor: colors.white,
          borderRadius: 20,
          padding: 16,
          minHeight: 116,
          ...shadows.card,
        },
        style,
      ]}
    >
      <IconTile name={icon} />
      <View style={{ height: 12 }} />
      <Text
        numberOfLines={2}
        style={{
          fontFamily: fontFamily.heading,
          fontSize: 15,
          lineHeight: 20,
          color: colors.navy,
        }}
      >
        {title}
      </Text>
      {hint ? (
        <Text
          numberOfLines={2}
          style={{
            marginTop: 4,
            fontFamily: fontFamily.medium,
            fontSize: 13,
            lineHeight: 18,
            color: colors.text2,
          }}
        >
          {hint}
        </Text>
      ) : null}
    </Pressable>
  );
}
