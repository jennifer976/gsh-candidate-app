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
    title: "Browse sponsored jobs",
    body: "Search verified roles with visa and relocation support — on the Jobs tab or from Home.",
  },
  {
    icon: "bookmark",
    iconBg: "rgba(97, 10, 144, 0.12)",
    title: "Save roles",
    body: "Bookmark jobs you like. Open Saved anytime from Home or your profile.",
  },
  {
    icon: "paper-plane",
    iconBg: colors.tealDim,
    title: "Track applications",
    body: "Apply on GSH, then follow status and employer chats in Applied and Chats.",
  },
];

type Props = {
  visible: boolean;
  onComplete: () => void;
};

export function CandidateOnboardingModal({ visible, onComplete }: Props) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Step>>(null);
  const [index, setIndex] = useState(0);

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
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
    void hapticLight();
  }, [index, onComplete]);

  const skip = useCallback(() => {
    void hapticLight();
    onComplete();
  }, [onComplete]);

  const isLast = index === STEPS.length - 1;

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={skip}>
      <View style={styles.root}>
        <GshNavyHero variant="full" style={styles.hero}>
          <SafeAreaView edges={["top"]} style={styles.safeTop}>
            <View style={styles.topBar}>
              <Text style={styles.brandEyebrow}>Welcome to GSH</Text>
              <Pressable onPress={skip} hitSlop={12} accessibilityRole="button" accessibilityLabel="Skip intro">
                <Text style={styles.skip}>Skip</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </GshNavyHero>

        <FlatList
          ref={listRef}
          data={STEPS}
          keyExtractor={(item) => item.title}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          onScrollToIndexFailed={() => undefined}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <View style={[styles.card, feedCardStyle()]}>
                <View style={[styles.iconTile, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={36} color={colors.navy} />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.body}</Text>
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
            title={isLast ? "Get started" : "Next"}
            onPress={goNext}
            containerStyle={styles.cta}
          />
          {isLast ? (
            <Pressable onPress={skip} style={styles.secondarySkip} accessibilityRole="button">
              <Text style={styles.secondarySkipText}>I'll explore on my own</Text>
            </Pressable>
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navyDeep },
  hero: { paddingBottom: 8 },
  safeTop: { paddingHorizontal: 20 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 12,
  },
  brandEyebrow: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  skip: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.teal },
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
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.2)" },
  dotOn: { width: 22, backgroundColor: colors.teal },
  cta: { marginBottom: 8 },
  secondarySkip: { alignItems: "center", paddingVertical: 10 },
  secondarySkipText: { fontSize: 14, fontFamily: fontFamily.medium, color: "rgba(255,255,255,0.5)" },
});
