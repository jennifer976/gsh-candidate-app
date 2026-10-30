import type { ReactNode } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const spring = { damping: 16, stiffness: 420 };

type Props = PressableProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Press scale (default 0.985). */
  pressScale?: number;
  /** Kept for callers; haptics are reserved for save / apply / finish sign-up. */
  haptic?: boolean;
};

/** Website-like active:scale press feedback for cards and rows. */
export function GshPressable({
  children,
  style,
  pressScale = 0.985,
  haptic: _haptic = false,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled && !reduceMotion) {
          scale.value = withSpring(pressScale, spring);
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, spring);
        onPressOut?.(e);
      }}
      style={[style, animStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
