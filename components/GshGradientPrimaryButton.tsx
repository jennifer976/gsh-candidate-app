import * as Haptics from "expo-haptics";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from "react-native-reanimated";
import { colors, fontFamily, radii } from "@/lib/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  title: string;
  tone?: "navy" | "cyan";
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Applied to the outer pressable (e.g. marginTop) */
  containerStyle?: ViewStyle;
};

const spring = { damping: 18, stiffness: 380 };

function lightTap() {
  if (Platform.OS === "web") return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Primary CTA. The legacy name remains to avoid changing caller contracts. */
export function GshGradientPrimaryButton({ title, onPress, disabled, loading, containerStyle, tone = "navy" }: Props) {
  const dim = disabled || loading;
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: Boolean(dim), busy: Boolean(loading) }}
      onPress={onPress}
      disabled={dim}
      onPressIn={() => {
        if (dim || reduceMotion) return;
        scale.value = withSpring(0.99, spring);
        lightTap();
      }}
      onPressOut={() => {
        scale.value = withSpring(1, spring);
      }}
      style={[styles.outer, containerStyle, animStyle, dim && styles.dimmed]}
    >
      <View style={[styles.fill, tone === "cyan" && {backgroundColor: colors.accent}]}>
        {loading ? <ActivityIndicator color={tone === "cyan" ? colors.navy : colors.white} /> : <Text style={[styles.text, tone === "cyan" && {color: colors.navy}]}>{title}</Text>}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  outer: { borderRadius: radii.pill, overflow: "hidden" },
  dimmed: { opacity: 0.72 },
  fill: {
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.navy,
  },
  text: { color: colors.white, fontSize: 17, fontFamily: fontFamily.semiBold },
});
