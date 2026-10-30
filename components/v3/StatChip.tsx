import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Icon, type IconName } from "@/components/Icon";
import { colors, fontFamily, shadows } from "@/lib/theme";

type ValueMode = {
  value: string;
  label: string;
  icon?: never;
};

type IconMode = {
  icon: IconName;
  label: string;
  value?: never;
};

export function StatChip({
  value,
  label,
  icon,
  style,
}: (ValueMode | IconMode) & { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.white,
          borderRadius: 16,
          paddingVertical: 10,
          paddingHorizontal: 14,
          ...shadows.chip,
        },
        style,
      ]}
    >
      {icon ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name={icon} size={18} color={colors.navy} strokeWidth={2} />
          <Text
            style={{
              fontFamily: fontFamily.semiBold,
              fontSize: 13,
              lineHeight: 16,
              color: colors.navy,
            }}
          >
            {label}
          </Text>
        </View>
      ) : (
        <>
          <Text
            style={{
              fontFamily: fontFamily.headingStrong,
              fontSize: 22,
              lineHeight: 24,
              letterSpacing: -0.6,
              color: colors.navy,
            }}
          >
            {value}
          </Text>
          <Text
            style={{
              fontFamily: fontFamily.medium,
              fontSize: 12,
              lineHeight: 16,
              color: colors.text2,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </View>
  );
}
