import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GshPressable } from "@/components/GshPressable";
import { colors, fontFamily, radii } from "@/lib/theme";

type Props = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

/**
 * Headway / Blinkist-style mission strip — bright cyan CTA that feels like a daily quest.
 * Mobbin: Headway "YOUR DAILY MISSION", Blinkist goal card.
 */
export function GshMissionBanner({
  title,
  subtitle,
  onPress,
  accessibilityLabel,
}: Props) {
  return (
    <GshPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      pressScale={0.98}
      style={styles.hit}
    >
      <LinearGradient
        colors={["#42e0e3", "#2bc9cc", "#42e0e3"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.banner}
      >
        <View style={styles.iconWell}>
          <Ionicons name="flash" size={18} color={colors.navy} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.navy} />
      </LinearGradient>
    </GshPressable>
  );
}

const styles = StyleSheet.create({
  hit: { borderRadius: radii.lg, overflow: "hidden" },
  banner: {
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWell: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(13,25,78,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, minWidth: 0 },
  title: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: "rgba(13,25,78,0.78)",
  },
});
