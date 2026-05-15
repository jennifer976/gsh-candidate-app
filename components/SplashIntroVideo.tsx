import { Video, ResizeMode } from "expo-av";
import type { AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fontFamily } from "@/lib/theme";

const introSource = require("../assets/splash-intro.mp4");

type Props = {
  onDone: () => void;
};

/**
 * Full-screen intro video on navy gradient — no extra logo lockups (avoids dark-on-dark marks).
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

  return (
    <View style={styles.root} accessibilityViewIsModal accessibilityLabel="Loading Global Sponsor Hub">
      <LinearGradient
        colors={["#040c24", "#080f2e", "#0d1a4a"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      <Video
        style={StyleSheet.absoluteFill}
        source={introSource}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        isMuted
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        onError={finish}
      />

      <Pressable
        onPress={finish}
        style={[styles.skipBtn, { bottom: Math.max(insets.bottom, 16) + 8, right: 20 }]}
        accessibilityRole="button"
        accessibilityLabel="Skip intro"
      >
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navyDeep },
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
