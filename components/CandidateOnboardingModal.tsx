import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useReducedMotion } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useCallback, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { modalFooterPad } from "@/lib/android-insets";
import { hapticLight } from "@/lib/haptics";
import { colors, fontFamily, radii } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

type GoalId = "find" | "found" | "move";

type Goal = {
  id: GoalId;
  icon: IonName;
  title: string;
  body: string;
};

const GOALS: Goal[] = [
  {
    id: "find",
    icon: "briefcase-outline",
    title: "Find sponsored jobs",
    body: "Browse roles with clear visa and relocation labels.",
  },
  {
    id: "found",
    icon: "people-outline",
    title: "Be found by employers",
    body: "Fill your profile — discovery stays off until you turn it on.",
  },
  {
    id: "move",
    icon: "airplane-outline",
    title: "Plan a move",
    body: "Independent specialists for visas and housing. You stay free.",
  },
];

type Props = {
  visible: boolean;
  onComplete: () => void;
};

/**
 * Immersive welcome — Blinkist/Headway progress + Glassdoor sticky CTA.
 * Scrollable goals; cyan CTA always visible above system nav.
 */
export function CandidateOnboardingModal({ visible, onComplete }: Props) {
  const ac = useAccountCopy();
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const [goalId, setGoalId] = useState<GoalId | null>(null);

  const skip = useCallback(() => {
    void hapticLight();
    onComplete();
  }, [onComplete]);

  const finish = useCallback(() => {
    if (!goalId) return;
    void hapticLight();
    onComplete();
  }, [goalId, onComplete]);

  return (
    <Modal
      visible={visible}
      animationType={reduceMotion ? "none" : "fade"}
      presentationStyle="fullScreen"
      onRequestClose={skip}
      statusBarTranslucent
    >
      <LinearGradient
        colors={["#9aeeee", "#e8fafb", "#ffffff"]}
        locations={[0, 0.28, 0.55]}
        style={[styles.root, { paddingTop: Math.max(insets.top, 12) }]}
      >
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.stepLabel}>{ac("STEP 1 OF 1")}</Text>

        <View style={styles.topBar}>
          <View style={styles.brandChip}>
            <Text style={styles.brandChipText}>Global Sponsor Hub</Text>
          </View>
          <Pressable
            onPress={skip}
            hitSlop={14}
            accessibilityRole="button"
            accessibilityLabel={ac("Skip intro")}
            style={styles.skipHit}
          >
            <Text style={styles.skip}>{ac("Skip")}</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces
        >
          <Text style={styles.heading}>{ac("What's your main goal?")}</Text>
          <Text style={styles.lead}>
            {ac("Pick one to personalise your start. You can change focus anytime.")}
          </Text>

          <View style={styles.goalList}>
            {GOALS.map((goal) => {
              const on = goalId === goal.id;
              return (
                <Pressable
                  key={goal.id}
                  style={[styles.goalRow, on && styles.goalRowOn]}
                  onPress={() => {
                    void hapticLight();
                    setGoalId(goal.id);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                >
                  <View style={[styles.goalIcon, on && styles.goalIconOn]}>
                    <Ionicons
                      name={goal.icon}
                      size={22}
                      color={on ? colors.navy : colors.navy}
                    />
                  </View>
                  <View style={styles.goalCopy}>
                    <Text style={styles.goalTitle}>{ac(goal.title)}</Text>
                    <Text style={styles.goalBody}>{ac(goal.body)}</Text>
                  </View>
                  <Ionicons
                    name={on ? "checkmark-circle" : "ellipse-outline"}
                    size={26}
                    color={on ? colors.cyan : colors.borderStrong}
                  />
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: modalFooterPad(insets.bottom) },
          ]}
        >
          <GshGradientPrimaryButton
            title={ac("Get started")}
            tone="cyan"
            onPress={finish}
            disabled={!goalId}
            containerStyle={styles.cta}
          />
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  progressTrack: {
    marginHorizontal: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(13,25,78,0.12)",
    overflow: "hidden",
  },
  progressFill: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.cyan,
    borderRadius: 2,
  },
  stepLabel: {
    marginTop: 8,
    marginHorizontal: 20,
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brandChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
  },
  brandChipText: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  skipHit: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  skip: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: fontFamily.headingStrong,
    color: colors.navy,
    letterSpacing: -0.6,
  },
  lead: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  goalList: { gap: 10 },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 92,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  goalRowOn: {
    borderColor: colors.cyan,
    backgroundColor: "rgba(66,224,227,0.16)",
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  goalIconOn: {
    backgroundColor: colors.cyan,
  },
  goalCopy: { flex: 1, minWidth: 0 },
  goalTitle: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
    marginBottom: 4,
  },
  goalBody: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  cta: { width: "100%" },
});
