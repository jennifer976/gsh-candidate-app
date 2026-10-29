import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DepthButton } from "@/components/gsh-brand";
import { StepHeroCard } from "@/components/onboarding/StepHeroCard";
import { EASE, useReduceMotion } from "@/lib/motion";
import type { SitePhotoKey } from "@/lib/sitePhotos";
import { colors, fontFamily } from "@/lib/theme";

type Props = {
  /** Sign-up progress position 1–7 (ignored in edit mode). */
  progressNow?: number;
  /** Sign-up progress max (always 7). */
  progressMax?: number;
  group: string;
  photo: SitePhotoKey;
  heading: string;
  sub: string;
  optional: boolean;
  editMode?: boolean;
  requiredNote?: boolean;
  children: ReactNode;
  saving?: boolean;
  canContinue: boolean;
  primaryLabel: string;
  error?: string | null;
  hintBanner?: string | null;
  onBack: () => void;
  onFinishLater?: () => void;
  onContinue: () => void;
  onDisabledPress?: () => void;
};

export function OnboardingShell({
  progressNow = 1,
  progressMax = 7,
  group,
  photo,
  heading,
  sub,
  optional: _optional,
  editMode = false,
  requiredNote = false,
  children,
  saving = false,
  canContinue,
  primaryLabel,
  error,
  hintBanner,
  onBack,
  onFinishLater,
  onContinue,
  onDisabledPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const progress = useSharedValue(
    editMode ? 0 : progressNow / Math.max(1, progressMax),
  );

  useEffect(() => {
    if (editMode) return;
    progress.value = withTiming(progressNow / Math.max(1, progressMax), {
      duration: reduce ? 0 : 450,
      easing: EASE,
    });
  }, [editMode, progress, progressMax, progressNow, reduce]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, progress.value)) * 100}%`,
  }));

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={onBack}
          style={styles.circleBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={20} color={colors.navy} />
        </Pressable>
        {editMode ? (
          <View style={styles.topSpacer} />
        ) : (
          <>
            <View
              style={styles.progressTrack}
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: progressMax,
                now: progressNow,
              }}
            >
              <Animated.View style={[styles.progressFill, barStyle]} />
            </View>
            {onFinishLater ? (
              <Pressable
                onPress={onFinishLater}
                hitSlop={8}
                style={styles.finishLater}
                accessibilityRole="button"
                accessibilityLabel="Finish later"
              >
                <Text style={styles.finishLaterText}>Finish later</Text>
              </Pressable>
            ) : (
              <View style={styles.finishLaterPlaceholder} />
            )}
          </>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StepHeroCard
            label={
              editMode ? "Edit profile" : `Step ${progressNow} of ${progressMax}`
            }
            title={group}
            photo={photo}
          />

          <Text style={styles.heading} accessibilityRole="header">
            {heading}
          </Text>
          <Text style={styles.sub}>{sub}</Text>

          <View style={styles.fields}>{children}</View>

          {requiredNote ? (
            <Text style={styles.requiredNote}>* Required</Text>
          ) : null}
          {error ? (
            <View style={styles.errorRow} accessibilityRole="alert">
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          {hintBanner ? (
            <Text style={styles.hintBanner} accessibilityLiveRegion="polite">
              {hintBanner}
            </Text>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View style={styles.primaryWrap}>
            <DepthButton
              title={primaryLabel}
              onPress={() => {
                if (!canContinue) {
                  onDisabledPress?.();
                  return;
                }
                onContinue();
              }}
              variant="navy"
              loading={saving}
              disabled={saving}
              style={
                !canContinue && !saving ? { opacity: 0.55 } : undefined
              }
            />
            {saving ? (
              <View style={styles.savingOverlay} pointerEvents="none">
                <ActivityIndicator color={colors.white} />
              </View>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  topSpacer: { flex: 1 },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.panel,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.cyan,
  },
  finishLater: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  finishLaterPlaceholder: { width: 44 },
  finishLaterText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  scroll: { paddingBottom: 24 },
  heading: {
    marginTop: 20,
    marginHorizontal: 20,
    fontFamily: fontFamily.headingStrong,
    fontSize: 26,
    lineHeight: 30,
    color: colors.navy,
  },
  sub: {
    marginTop: 8,
    marginHorizontal: 20,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text2,
  },
  fields: { marginTop: 18, paddingHorizontal: 20, gap: 14 },
  requiredNote: {
    marginTop: 16,
    marginHorizontal: 20,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.text2,
  },
  errorRow: {
    marginTop: 14,
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.error,
  },
  hintBanner: {
    marginTop: 12,
    marginHorizontal: 20,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.navy,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
  },
  primaryWrap: { flex: 1 },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
