import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Icon } from "@/components/Icon";
import { Eyebrow } from "@/components/gsh-brand";
import { colors, fontFamily } from "@/lib/theme";

export function SectionHeader({
  eyebrow,
  title,
  tonePart,
  seeAllLabel = "See all",
  onSeeAll,
  style,
}: {
  eyebrow?: string;
  title: string;
  tonePart?: string;
  seeAllLabel?: string;
  onSeeAll?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
        },
        style,
      ]}
    >
      <View style={{ flex: 1, gap: 6 }}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Text
          accessibilityRole="header"
          style={{
            fontFamily: fontFamily.headingStrong,
            fontSize: 21,
            lineHeight: 26,
            letterSpacing: -0.6,
            color: colors.navy,
          }}
        >
          {title}
          {tonePart ? (
            <Text style={{ color: colors.tone }}>{` ${tonePart}`}</Text>
          ) : null}
          <Text style={{ color: colors.cyan }}>.</Text>
        </Text>
      </View>
      {onSeeAll ? (
        <Pressable
          onPress={onSeeAll}
          accessibilityRole="button"
          accessibilityLabel={seeAllLabel}
          hitSlop={8}
          style={{
            minHeight: 44,
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Text
            style={{
              fontFamily: fontFamily.semiBold,
              fontSize: 14,
              color: colors.text2,
            }}
          >
            {seeAllLabel}
          </Text>
          <Icon name="chevron-right" size={18} color={colors.text2} strokeWidth={1.8} />
        </Pressable>
      ) : null}
    </View>
  );
}
