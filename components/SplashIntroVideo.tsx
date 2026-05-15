import { Video, ResizeMode } from "expo-av";
import type { AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { brandLogo, brandMark } from "@/lib/brand-assets";
import { colors, fontFamily } from "@/lib/theme";

const introSource = require("../assets/splash-intro.mp4");

type Props = {
  onDone: () => void;
};

/**
 * Premium animated splash: gradient + intro video + animated mark/wordmark.
 * Wordmark uses white tint so the lockup reads on navy (not dark-on-dark).
 */
export function SplashIntroVideo({ onDone }: Props) {
  const insets = useSafeAreaInsets();
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    const t = setTimeout(finish, 4500);
    return () => clearTimeout(t);
  }, [finish]);

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      if (status.didJustFinish) finish();
    },
    [finish]
  );

  const ring1Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0.6);
  const ring2Scale = useSharedValue(1);
  const ring2Opacity = useSharedValue(0.4);

  useEffect(() => {
    ring1Scale.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(1.6, { duration: 1800, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 0 })
        ),
        -1,
        false
      )
    );
    ring1Opacity.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 1800, easing: Easing.out(Easing.quad) }),
          withTiming(0.5, { duration: 0 })
        ),
        -1,
        false
      )
    );
    ring2Scale.value = withDelay(
      900,
      withRepeat(
        withSequence(
          withTiming(1.9, { duration: 1800, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 0 })
        ),
        -1,
        false
      )
    );
    ring2Opacity.value = withDelay(
      900,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 1800, easing: Easing.out(Easing.quad) }),
          withTiming(0.3, { duration: 0 })
        ),
        -1,
        false
      )
    );
  }, [ring1Opacity, ring1Scale, ring2Opacity, ring2Scale]);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));
  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));

  return (
    <View style={styles.root} accessibilityViewIsModal accessibilityLabel="Loading Global Sponsor Hub">
      <LinearGradient
        colors={["#040c24", "#080f2e", "#0d1a4a"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      <Video
        style={[StyleSheet.absoluteFill, styles.video]}
        source={introSource}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        isMuted
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        onError={finish}
      />

      <View style={styles.logoContainer}>
        <View style={styles.ringWrap}>
          <Animated.View style={[styles.ring, styles.ring1, ring1Style]} />
          <Animated.View style={[styles.ring, styles.ring2, ring2Style]} />
        </View>

        <Animated.View entering={FadeIn.delay(200).duration(600)} style={styles.markWrap}>
          <Image
            source={brandMark}
            style={styles.mark}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(700).springify()}>
          <Image
            source={brandLogo}
            style={styles.wordmark}
            resizeMode="contain"
            tintColor="rgba(255,255,255,0.95)"
            accessibilityIgnoresInvertColors
            accessibilityLabel="Global Sponsor Hub"
          />
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(800).duration(600)} style={styles.tagline}>
          Global opportunities. Real support.
        </Animated.Text>

        <Animated.View entering={FadeIn.delay(1000).duration(500)} style={styles.accentBar} />
      </View>

      <Pressable
        onPress={finish}
        style={[styles.skipBtn, { bottom: Math.max(insets.bottom, 20) + 8, right: 20 }]}
        accessibilityRole="button"
        accessibilityLabel="Skip intro"
      >
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
    </View>
  );
}

const RING_SIZE = 100;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navyDeep },
  video: { opacity: 0.35 },

  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  ringWrap: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1.5,
  },
  ring1: { borderColor: colors.teal },
  ring2: { borderColor: "rgba(14,205,209,0.5)" },

  markWrap: {
    width: 80,
    height: 80,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 4,
  },
  mark: { width: 80, height: 80 },

  wordmark: {
    width: 220,
    height: 56,
  },
  tagline: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textOnDarkMuted,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  accentBar: {
    marginTop: 8,
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.teal,
  },

  skipBtn: {
    position: "absolute",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  skipText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
});
