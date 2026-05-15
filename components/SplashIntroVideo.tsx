import { Video, ResizeMode } from "expo-av";
import type { AVPlaybackStatus } from "expo-av";
import { useCallback, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fontFamily, radii } from "@/lib/theme";

const introSource = require("../assets/splash-intro.mp4");

type Props = {
  onDone: () => void;
};

export function SplashIntroVideo({ onDone }: Props) {
  const insets = useSafeAreaInsets();
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }, [onDone]);

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      if (status.didJustFinish) finish();
    },
    [finish]
  );

  return (
    <View style={styles.root} accessibilityViewIsModal>
      <Video
        style={StyleSheet.absoluteFill}
        source={introSource}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        isMuted={false}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        onError={() => finish()}
      />
      <Pressable
        onPress={finish}
        style={[styles.skipBtn, { bottom: Math.max(insets.bottom, 16) + 8, right: 16 }]}
        accessibilityRole="button"
        accessibilityLabel="Skip intro video"
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
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.navy,
  },
});
