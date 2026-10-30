import type { ReactNode } from "react";
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Icon, type IconName } from "@/components/Icon";
import { Card } from "@/components/v3/Card";
import { IconTile } from "@/components/v3/IconTile";
import { colors, fontFamily } from "@/lib/theme";

export function RowCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Card
      padding={0}
      style={[{ paddingVertical: 4, paddingHorizontal: 18 }, style]}
    >
      {children}
    </Card>
  );
}

export function Row({
  label,
  hint,
  icon,
  onPress,
  isLast = false,
}: {
  label: string;
  hint?: string;
  icon?: IconName;
  onPress?: () => void;
  isLast?: boolean;
}) {
  const a11y = hint ? `${label}. ${hint}` : label;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={{
        minHeight: 60,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.line,
      }}
    >
      {icon ? <IconTile name={icon} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            fontFamily: fontFamily.medium,
            fontSize: 15,
            lineHeight: 20,
            color: colors.navy,
          }}
        >
          {label}
        </Text>
        {hint ? (
          <Text
            style={{
              fontFamily: fontFamily.regular,
              fontSize: 13,
              lineHeight: 18,
              color: colors.text2,
            }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
      <Icon name="chevron-right" size={18} color={colors.muted} strokeWidth={1.8} />
    </Pressable>
  );
}
