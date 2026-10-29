import { hapticLight } from "@/lib/haptics";
import { colors, shadows } from "@/lib/theme";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  AccessibilityInfo,
  BackHandler,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type EntryOrExitLayoutType,
} from "react-native-reanimated";

/** Staggered entrance delays that match the marketing site’s calm reveal pace. */
export const MOTION = {
  hero: 40,
  primary: 60,
  secondary: 90,
  tertiary: 120,
  duration: 280,
} as const;

export const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

export function enterDown(delay = 0, reducedMotion?: boolean | null): EntryOrExitLayoutType | undefined {
  if (reducedMotion) return undefined;
  return FadeInDown.delay(delay).duration(280);
}

export function enterUp(delay = 0, reducedMotion?: boolean | null): EntryOrExitLayoutType | undefined {
  if (reducedMotion) return undefined;
  return FadeInUp.delay(delay).duration(280);
}

export function enterFade(delay = 0, reducedMotion?: boolean | null): EntryOrExitLayoutType | undefined {
  if (reducedMotion) return undefined;
  return FadeIn.delay(delay).duration(220);
}

export function useReduceMotion(): boolean {
  const reanimated = useReducedMotion();
  const [system, setSystem] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setSystem(Boolean(v));
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", (v) => {
      setSystem(Boolean(v));
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return Boolean(reanimated || system);
}

export function RiseIn({
  delay = 0,
  children,
  style,
}: {
  delay?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const reduce = useReduceMotion();
  const opacity = useSharedValue(reduce ? 1 : 0);
  const translateY = useSharedValue(reduce ? 0 : 18);

  useEffect(() => {
    if (reduce) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = 0;
    translateY.value = 18;
    opacity.value = withDelay(delay, withTiming(1, { duration: 700, easing: EASE }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 700, easing: EASE }));
  }, [delay, opacity, reduce, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[style, animStyle]}>{children}</Animated.View>;
}

export function FloatIn({
  delay = 0,
  rotate = "-3deg",
  children,
  style,
}: {
  delay?: number;
  rotate?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const reduce = useReduceMotion();
  const opacity = useSharedValue(reduce ? 1 : 0);
  const translateY = useSharedValue(reduce ? 0 : 14);
  const scale = useSharedValue(reduce ? 1 : 0.96);

  useEffect(() => {
    if (reduce) {
      opacity.value = 1;
      translateY.value = 0;
      scale.value = 1;
      return;
    }
    opacity.value = 0;
    translateY.value = 14;
    scale.value = 0.96;
    opacity.value = withDelay(delay, withTiming(1, { duration: 800, easing: EASE }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 800, easing: EASE }));
    scale.value = withDelay(delay, withTiming(1, { duration: 800, easing: EASE }));
  }, [delay, opacity, reduce, scale, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }, { rotate }],
  }));

  return <Animated.View style={[style, animStyle]}>{children}</Animated.View>;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function useCountUp(
  target: number,
  { duration = 1100, delay = 0 }: { duration?: number; delay?: number } = {},
): string {
  const reduce = useReduceMotion();
  const [value, setValue] = useState(reduce ? target : 0);

  useEffect(() => {
    if (reduce) {
      setValue(target);
      return;
    }
    let frame = 0;
    let startAt = 0;
    const timeout = setTimeout(() => {
      startAt = Date.now();
      const tick = () => {
        const t = Math.min(1, (Date.now() - startAt) / duration);
        setValue(Math.round(target * easeOutCubic(t)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [delay, duration, reduce, target]);

  return value.toLocaleString("en-GB");
}

export function PressScale({
  children,
  onPress,
  style,
  accessibilityLabel,
  accessibilityRole = "button",
  disabled,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: "button" | "link";
  disabled?: boolean;
}) {
  const reduce = useReduceMotion();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => {
        if (reduce || disabled) return;
        scale.value = withTiming(0.97, { duration: 120, easing: EASE });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120, easing: EASE });
      }}
      style={({ pressed }) => [style, reduce && pressed ? { opacity: 0.9 } : null]}
    >
      <Animated.View style={animStyle}>{children}</Animated.View>
    </Pressable>
  );
}

export function useHeartPop() {
  const reduce = useReduceMotion();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const trigger = useCallback(() => {
    void hapticLight();
    if (reduce) return;
    scale.value = withSequence(
      withTiming(1.28, { duration: 120, easing: EASE }),
      withTiming(0.92, { duration: 120, easing: EASE }),
      withTiming(1, { duration: 140, easing: EASE }),
    );
  }, [reduce, scale]);

  return { style, trigger };
}

export function BottomSheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const reduce = useReduceMotion();
  const screenH = Dimensions.get("window").height;
  const translateY = useSharedValue(screenH);
  const backdrop = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      if (reduce) {
        translateY.value = 0;
        backdrop.value = 1;
        return;
      }
      translateY.value = screenH;
      backdrop.value = 0;
      translateY.value = withTiming(0, { duration: 320, easing: EASE });
      backdrop.value = withTiming(1, { duration: 200, easing: EASE });
      return;
    }
    if (!mounted) return;
    if (reduce) {
      setMounted(false);
      return;
    }
    translateY.value = withTiming(screenH, { duration: 240, easing: EASE }, (finished) => {
      if (finished) runOnJS(setMounted)(false);
    });
    backdrop.value = withTiming(0, { duration: 200, easing: EASE });
  }, [backdrop, mounted, reduce, screenH, translateY, visible]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose, visible]);

  const closeFromDrag = useCallback(() => {
    onClose();
  }, [onClose]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > 110 || e.velocityY > 900) {
        runOnJS(closeFromDrag)();
      } else {
        translateY.value = withTiming(0, { duration: 220, easing: EASE });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value,
  }));

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={sheetStyles.root} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
          <Animated.View style={[sheetStyles.backdrop, backdropStyle]} />
        </Pressable>
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[sheetStyles.sheet, { maxHeight: screenH * 0.88 }, sheetStyle]}
            accessibilityViewIsModal
          >
            <View style={sheetStyles.grabberWrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <View style={sheetStyles.grabber} />
            </View>
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

/** Stagger delay for list rows: index * 90, capped after the 6th item. */
export function listStaggerDelay(index: number): number {
  return index < 6 ? index * 90 : 0;
}

const sheetStyles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13,25,78,0.45)",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...shadows.lift,
    overflow: "hidden",
  },
  grabberWrap: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#d5dae6",
  },
});
