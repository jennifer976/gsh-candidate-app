import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useReducedMotion } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useCallback, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DecorRing,
  DepthButton,
  DepthPressable,
  Eyebrow,
  IconBadge,
  PosterTitle,
  posterParts,
} from "@/components/gsh-brand";
import { modalFooterPad } from "@/lib/android-insets";
import { brandLockupNavy } from "@/lib/brand-assets";
import { hapticLight } from "@/lib/haptics";
import { colors, fontFamily } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

type GoalId = "find" | "found" | "move";

type Goal = {
  id: GoalId;
  icon: IonName;
  title: string;
  body: string;
  route: string;
};

const GOALS: Goal[] = [
  {
    id: "find",
    icon: "briefcase",
    title: "Find sponsored jobs",
    body: "Browse roles with clear visa and relocation labels.",
    route: "/(tabs)/jobs",
  },
  {
    id: "found",
    icon: "people",
    title: "Be found by employers",
    body: "Fill your profile — discovery stays off until you turn it on.",
    route: "/mobility-profile",
  },
  {
    id: "move",
    icon: "airplane",
    title: "Plan a move",
    body: "Independent specialists for visas and housing. You stay free.",
    route: "/relocation-help",
  },
];

type Props = {
  visible: boolean;
  /** Called with the chosen goal's screen, or with nothing when skipped. */
  onComplete: (route?: string) => void;
};

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
    const goal = GOALS.find((g) => g.id === goalId);
    if (!goal) return;
    onComplete(goal.route);
  }, [goalId, onComplete]);

  return (
    <Modal
      visible={visible}
      animationType={reduceMotion ? "none" : "fade"}
      presentationStyle="fullScreen"
      onRequestClose={skip}
      statusBarTranslucent
    >
      <View style={[styles.root, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <DecorRing size={240} thickness={34} color="rgba(66,224,227,0.22)" style={{ right: -110, top: 70 }} />
        <DecorRing size={200} thickness={30} color="rgba(13,25,78,0.05)" style={{ left: -120, bottom: 150 }} />

        <View style={styles.topBar}>
          <Image
            source={brandLockupNavy}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Global Sponsor Hub"
          />
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
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Eyebrow>{ac("Welcome")}</Eyebrow>
          <PosterTitle {...posterParts(ac("What's your|main goal?"))} size={38} style={styles.title} />
          <Text style={styles.lead}>
            {ac("Pick one to personalise your start. You can change focus anytime.")}
          </Text>

          <View style={styles.goalList} accessibilityRole="radiogroup">
            {GOALS.map((goal) => {
              const on = goalId === goal.id;
              return (
                <DepthPressable
                  key={goal.id}
                  onPress={() => setGoalId(goal.id)}
                  face={on ? colors.cyan : colors.white}
                  depthColor={colors.navy}
                  depth={5}
                  radius={22}
                  borderWidth={2}
                  borderColor={colors.navy}
                  selected={on}
                  accessibilityRole="radio"
                  accessibilityLabel={`${ac(goal.title)}. ${ac(goal.body)}`}
                  innerStyle={styles.goalRow}
                >
                  <IconBadge
                    icon={goal.icon}
                    face={colors.navy}
                    color={colors.cyan}
                    size={50}
                    radius={16}
                  />
                  <View style={styles.goalCopy}>
                    <Text style={styles.goalTitle}>{ac(goal.title)}</Text>
                    <Text style={[styles.goalBody, on && styles.goalBodyOn]}>{ac(goal.body)}</Text>
                  </View>
                  <View style={[styles.radio, on && styles.radioOn]}>
                    {on ? <Ionicons name="checkmark" size={16} color={colors.cyan} /> : null}
                  </View>
                </DepthPressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: modalFooterPad(insets.bottom) }]}>
          <DepthButton
            title={ac("Get started")}
            variant="navy"
            onPress={finish}
            disabled={!goalId}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, overflow: "hidden" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  logo: { width: 150, height: 30 },
  skipHit: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  skip: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.navy, textDecorationLine: "underline" },
  progressTrack: {
    marginTop: 12,
    marginHorizontal: 20,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(13,25,78,0.1)",
    overflow: "hidden",
  },
  progressFill: { width: "100%", height: "100%", borderRadius: 5, backgroundColor: colors.navy },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 },
  title: { marginTop: 10 },
  lead: {
    marginTop: 14,
    marginBottom: 22,
    maxWidth: 330,
    fontSize: 15,
    lineHeight: 23,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  goalList: { gap: 14 },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 92,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  goalCopy: { flex: 1, minWidth: 0 },
  goalTitle: { fontSize: 16, lineHeight: 21, fontFamily: fontFamily.heading, color: colors.navy },
  goalBody: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  goalBodyOn: { color: colors.navy },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(13,25,78,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { borderColor: colors.navy, backgroundColor: colors.navy },
  footer: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: colors.white },
});
