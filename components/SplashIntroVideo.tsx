import { Video, ResizeMode } from "expo-av";
import type { AVPlaybackStatus } from "expo-av";
import { useCallback, useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fontFamily } from "@/lib/theme";

const introSource = require("../assets/splash-intro.mp4");

type Props = {
  onDone: () => void;
};

/** Full-screen brand intro video only — no extra logos or graphics. */
export function SplashIntroVideo({ onDone }: Props) {
  const insets = useSafeAreaInsets();
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    const t = setTimeout(finish, 12000);
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
      <Video
        style={StyleSheet.absoluteFill}
        source={introSource}
        resizeMode={ResizeMode.CONTAIN}
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
