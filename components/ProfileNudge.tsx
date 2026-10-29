import { Pressable, StyleSheet, Text, View } from "react-native";
import { RiseIn } from "@/lib/motion";
import { nudgeText } from "@/lib/profileNudge";
import { colors, fontFamily, shadows } from "@/lib/theme";

type Props = {
  percent: number;
  onFinishNow: () => void;
  onNotNow: () => void;
};

/** Calm coach-mark above the Home profile progress card. */
export function ProfileNudge({ percent, onFinishNow, onNotNow }: Props) {
  return (
    <RiseIn delay={80}>
      <View
        style={styles.wrap}
        accessibilityLiveRegion="polite"
        accessibilityRole="summary"
      >
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <View style={styles.dot} accessibilityElementsHidden />
            <Text style={styles.title}>{nudgeText(percent)}</Text>
          </View>
          <Text style={styles.body}>
            A complete profile gives employers more to go on.
          </Text>
          <View style={styles.actions}>
            <Pressable
              onPress={onFinishNow}
              style={styles.finishBtn}
              accessibilityRole="button"
              accessibilityLabel="Finish now"
            >
              <Text style={styles.finishText}>Finish now</Text>
            </Pressable>
            <Pressable
              onPress={onNotNow}
              style={styles.notNowBtn}
              accessibilityRole="button"
              accessibilityLabel="Not now"
            >
              <Text style={styles.notNowText}>Not now</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.triangle} accessibilityElementsHidden />
      </View>
    </RiseIn>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 4,
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    ...shadows.card,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.cyan,
  },
  title: {
    flex: 1,
    fontFamily: fontFamily.heading,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
  },
  body: {
    marginTop: 8,
    marginLeft: 15,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text2,
  },
  actions: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  finishBtn: {
    height: 44,
    minWidth: 120,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  finishText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.white,
  },
  notNowBtn: {
    height: 44,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  notNowText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  triangle: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.white,
  },
});
