import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useReducedMotion } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshNavyHero } from "@/components/GshNavyHero";
import { hapticLight } from "@/lib/haptics";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

type Step = {
  icon: IonName;
  iconBg: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    icon: "compass",
    iconBg: colors.brandSoft,
    title: "Find work",
    body: "Browse direct, external and agency-listed jobs. Each listing shows the mobility offer the employer stated.",
  },
  {
    icon: "people",
    iconBg: colors.tealDim,
    title: "Be found — if you want",
    body: "Fill in your profile. Employers and agencies can find you only if you turn that on under Who can find and contact you?",
  },
  {
    icon: "airplane",
    iconBg: colors.surfaceMuted,
    title: "Plan the move",
    body: "Need visa, housing or relocation help? Request an independent specialist. You stay free. We do not run the move.",
  },
];

type Props = {
  visible: boolean;
  onComplete: () => void;
};

export function CandidateOnboardingModal({ visible, onComplete }: Props) {
  const ac = useAccountCopy();
  const reduceMotion = useReducedMotion();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Step>>(null);
  const [index, setIndex] = useState(0);
  const [slideHeight, setSlideHeight] = useState(0);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / width);
      if (next !== index) {
        setIndex(next);
        void hapticLight();
      }
    },
    [index, width]
  );

  const goNext = useCallback(() => {
    if (index >= STEPS.length - 1) {
      onComplete();
      return;
    }
    const next = index + 1;
    listRef.current?.scrollToIndex({ index: next, animated: !reduceMotion });
    setIndex(next);
    void hapticLight();
  }, [index, onComplete, reduceMotion]);

  const skip = useCallback(() => {
    void hapticLight();
    onComplete();
  }, [onComplete]);

  const isLast = index === STEPS.length - 1;

  return (
    <Modal visible={visible} animationType={reduceMotion ? "none" : "fade"} presentationStyle="fullScreen" onRequestClose={skip}>
      <View style={styles.root}>
        <GshNavyHero variant="full" style={styles.hero}>
          <SafeAreaView edges={["top"]} style={styles.safeTop}>
            <View style={styles.topBar}>
              <Text style={styles.brandEyebrow}>{ac("Welcome to Global Sponsor Hub")}</Text>
              <Pressable onPress={skip} hitSlop={12} accessibilityRole="button" accessibilityLabel={ac("Skip intro")}>
                <Text style={styles.skip}>{ac("Skip")}</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </GshNavyHero>

        <FlatList
          ref={listRef}
          style={styles.slider}
          contentContainerStyle={styles.pages}
          onLayout={(event) => setSlideHeight(event.nativeEvent.layout.height)}
          data={STEPS}
          keyExtractor={(item) => item.title}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          onScrollToIndexFailed={() => undefined}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width, minHeight: slideHeight }]}>
              <View style={[styles.card, feedCardStyle()]}>
                <View style={[styles.iconTile, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={36} color={colors.navy} />
                </View>
                <Text style={styles.cardTitle}>{ac(item.title)}</Text>
                <Text style={styles.cardBody}>{ac(item.body)}</Text>
              </View>
            </View>
          )}
        />

        <SafeAreaView edges={["bottom"]} style={styles.footer}>
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotOn]} />
            ))}
          </View>
          <GshGradientPrimaryButton
            title={ac(isLast ? "Get started" : "Next")}
            onPress={goNext}
            containerStyle={styles.cta}
          />

        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  hero: { paddingBottom: 8 },
  safeTop: { paddingHorizontal: 20 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  brandEyebrow: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.accent,
    flex: 1,
    letterSpacing: 0.6,
    textTransform: "lowercase",
  },
  skip: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.teal },
  slider: { flex: 1 },
  pages: { flexGrow: 1, alignItems: "stretch" },
  slide: { paddingHorizontal: 20, justifyContent: "center", paddingBottom: 12 },
  card: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    borderRadius: radii.lg,
  },
  iconTile: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: fontFamily.extraBold,
    color: colors.navy,
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, backgroundColor: colors.white },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.borderStrong },
  dotOn: { width: 22, backgroundColor: colors.navy },
  cta: { marginBottom: 8 },
});
