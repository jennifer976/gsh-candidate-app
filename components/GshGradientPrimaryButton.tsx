import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { colors, fontFamily, gradient } from "@/lib/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  title: string;
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

/** Primary CTA — teal → purple gradient matching web auth. */
export function GshGradientPrimaryButton({ title, onPress, disabled, loading, containerStyle }: Props) {
  const dim = disabled || loading;
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={dim}
      onPressIn={() => {
        if (dim) return;
        scale.value = withSpring(0.97, spring);
        lightTap();
      }}
      onPressOut={() => {
        scale.value = withSpring(1, spring);
      }}
      style={[styles.outer, containerStyle, animStyle, dim && styles.dimmed]}
    >
      <LinearGradient colors={[...gradient.authCTA]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.grad}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.text}>{title}</Text>}
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  outer: { borderRadius: 12, overflow: "hidden" },
  dimmed: { opacity: 0.72 },
  grad: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  text: { color: colors.white, fontSize: 17, fontFamily: fontFamily.semiBold },
});
