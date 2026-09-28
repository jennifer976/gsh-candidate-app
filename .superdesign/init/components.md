# Shared UI primitives

Framework: React Native / Expo with a custom component system. There is no shadcn, MUI, Chakra, NativeBase, Tailwind, or CSS utility layer. The bounded source set below covers the main reusable interaction, CTA, content-row/card/chip, form-selection, loading, and empty-state patterns.

## `components/GshPressable.tsx` — GshPressable

Animated base pressable used by cards, rows, chrome buttons, and banners.

Key props: all `PressableProps`, `pressScale`, `haptic`, `disabled`, `style`, `children`.

```tsx
import type { ReactNode } from "react";
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const spring = { damping: 16, stiffness: 420 };

type Props = PressableProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Press scale (default 0.985). */
  pressScale?: number;
  haptic?: boolean;
};

/** Website-like active:scale press feedback for cards and rows. */
export function GshPressable({
  children,
  style,
  pressScale = 0.985,
  haptic = true,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled && !reduceMotion) {
          scale.value = withSpring(pressScale, spring);
          if (haptic && Platform.OS !== "web") {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, spring);
        onPressOut?.(e);
      }}
      style={[style, animStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
```

## `components/GshGradientPrimaryButton.tsx` — GshGradientPrimaryButton

Primary navy/cyan pill CTA with loading, disabled, spring, and haptic behavior.

Key props: `title`, `tone`, `onPress`, `disabled`, `loading`, `containerStyle`.

```tsx
import * as Haptics from "expo-haptics";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from "react-native-reanimated";
import { colors, fontFamily, radii } from "@/lib/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  title: string;
  tone?: "navy" | "cyan";
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Applied to the outer pressable (e.g. marginTop) */
  containerStyle?: ViewStyle;
};

const spring = { damping: 18, stiffness: 380 };

function lightTap() {
  if (Platform.OS === "web") return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Primary CTA. The legacy name remains to avoid changing caller contracts. */
export function GshGradientPrimaryButton({ title, onPress, disabled, loading, containerStyle, tone = "navy" }: Props) {
  const dim = disabled || loading;
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: Boolean(dim), busy: Boolean(loading) }}
      onPress={onPress}
      disabled={dim}
      onPressIn={() => {
        if (dim || reduceMotion) return;
        scale.value = withSpring(0.99, spring);
        lightTap();
      }}
      onPressOut={() => {
        scale.value = withSpring(1, spring);
      }}
      style={[styles.outer, containerStyle, animStyle, dim && styles.dimmed]}
    >
      <View style={[styles.fill, tone === "cyan" && {backgroundColor: colors.accent}]}>
        {loading ? <ActivityIndicator color={tone === "cyan" ? colors.navy : colors.white} /> : <Text style={[styles.text, tone === "cyan" && {color: colors.navy}]}>{title}</Text>}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  outer: { borderRadius: radii.pill, overflow: "hidden" },
  dimmed: { opacity: 0.72 },
  fill: {
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.navy,
  },
  text: { color: colors.white, fontSize: 17, fontFamily: fontFamily.semiBold },
});
```

## `components/gsh-ui-kit.tsx` — content primitives

Shared intros, section titles, link rows, hero cards, tips, completion, accent bars, buttons, and chips.

Key props: see each exported component signature.

```tsx
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { GshPressable } from "@/components/GshPressable";
import { STACK_HEADER_BODY_GAP } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

export type GshLinkAccent = "teal" | "purple" | "ocean";

const ACCENT: Record<GshLinkAccent, { wrap: string; icon: string }> = {
  teal: { wrap: colors.brandSoft, icon: colors.navy },
  purple: { wrap: colors.surfaceMuted, icon: colors.navy },
  ocean: { wrap: colors.surfaceMuted, icon: colors.navy },
};

export function GshScreenIntro({
  eyebrow,
  title,
  subtitle,
  style,
  underStackHeader,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  style?: ViewStyle;
  /** Extra top inset when this intro sits directly under a native header (FlatList header, etc.) */
  underStackHeader?: boolean;
}) {
  return (
    <View style={[introStyles.wrap, underStackHeader && introStyles.underStack, style]}>
      {eyebrow ? <Text style={introStyles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={introStyles.title}>{title}</Text>
      {subtitle ? <Text style={introStyles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const introStyles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  underStack: { paddingTop: STACK_HEADER_BODY_GAP },
  eyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: colors.teal,
    letterSpacing: 0.8,
    textTransform: "lowercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: fontFamily.headingStrong,
    color: colors.navy,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export function GshSectionTitle({
  title,
  hint,
  actionLabel,
  onAction,
  topSpacing = "md",
  onDark = false,
  style,
}: {
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
  topSpacing?: "none" | "sm" | "md" | "lg";
  /** Light text for navy canvas sections (Home, Jobs list). */
  onDark?: boolean;
  style?: ViewStyle;
}) {
  const mt = topSpacing === "none" ? 0 : topSpacing === "sm" ? 8 : topSpacing === "lg" ? 28 : 18;
  return (
    <View style={[{ marginTop: mt, marginBottom: hint || actionLabel ? 8 : 10 }, style]}>
      <View style={secStyles.titleRow}>
        <View style={secStyles.rule} />
        <Text style={[secStyles.title, onDark && secStyles.titleOnDark]}>{title}</Text>
        {actionLabel && onAction ? (
          <Pressable style={secStyles.actionHit} onPress={onAction} hitSlop={10} accessibilityRole="button">
            <Text style={[secStyles.action, onDark && secStyles.actionOnDark]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {hint ? <Text style={[secStyles.hint, onDark && secStyles.hintOnDark]}>{hint}</Text> : null}
    </View>
  );
}

const secStyles = StyleSheet.create({
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  rule: { width: 4, height: 20, borderRadius: 2, backgroundColor: colors.teal },
  title: {
    flex: 1,
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.3,
  },
  titleOnDark: { color: colors.white },
  actionHit: { minHeight: 44, justifyContent: "center" },
  action: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.brand },
  actionOnDark: { color: colors.teal },
  hint: {
    marginTop: 6,
    marginLeft: 14,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 20,
  },
  hintOnDark: { color: "rgba(255,255,255,0.55)" },
});

export function GshLinkRow({
  title,
  subtitle,
  icon,
  accent,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: IonName;
  accent: GshLinkAccent;
  onPress: () => void;
}) {
  const pal = ACCENT[accent];
  return (
    <GshPressable
      style={[rowStyles.row, cardSurfaceStyle(true)]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={[rowStyles.iconTile, { backgroundColor: pal.wrap }]}>
        <Ionicons name={icon} size={24} color={pal.icon} />
      </View>
      <View style={rowStyles.textCol}>
        <Text style={rowStyles.rowTitle}>{title}</Text>
        <Text style={rowStyles.rowSub}>{subtitle}</Text>
      </View>
      <View style={rowStyles.chev}>
        <Ionicons name="chevron-forward" size={20} color={colors.navy} />
      </View>
    </GshPressable>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
  },
  textCol: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.navy, letterSpacing: -0.2 },
  rowSub: { marginTop: 5, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 20 },
  chev: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
});

export function GshNavyHeroCard({
  badge = "Global Sponsor Hub",
  title,
  children,
  footer,
}: {
  badge?: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <View style={heroStyles.card}>
      <View style={heroStyles.badge}>
        <Text style={heroStyles.badgeText}>{badge}</Text>
      </View>
      <Text style={heroStyles.title}>{title}</Text>
      {typeof children === "string" ? <Text style={heroStyles.body}>{children}</Text> : <View>{children}</View>}
      {footer ? <View style={heroStyles.footer}>{footer}</View> : null}
    </View>
  );
}

const heroStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.navy,
    padding: 22,
    marginBottom: 8,
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 0.6,
    textTransform: "lowercase",
  },
  title: {
    fontSize: 26,
    fontFamily: fontFamily.headingStrong,
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.88)",
    lineHeight: 23,
  },
  footer: { marginTop: 16 },
});

export function GshMessengerTip({ children }: { children: string }) {
  return (
    <View style={tipStyles.wrap}>
      <View style={tipStyles.inner}>
        <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.navy} />
        <Text style={tipStyles.text}>{children}</Text>
      </View>
    </View>
  );
}

const tipStyles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    marginBottom: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
  },
  inner: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16 },
  text: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 21,
  },
});

export function GshCompletionStrip({ pct }: { pct: number | null }) {
  if (pct == null) return null;
  const w = Math.min(100, Math.max(0, pct));
  return (
    <View style={[stripStyles.card, cardSurfaceStyle(false)]}>
      <Text style={stripStyles.label}>Profile completion</Text>
      <View style={stripStyles.row}>
        <Text style={stripStyles.pct}>{pct}%</Text>
        <Text style={stripStyles.hint}>{pct >= 100 ? "Great work" : "Strong profiles get more replies"}</Text>
      </View>
      <View style={stripStyles.track}>
        <View style={[stripStyles.fill, { width: `${w}%` }]} />
      </View>
    </View>
  );
}

const stripStyles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: radii.lg,
    marginBottom: 18,
  },
  label: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.textSecondary, letterSpacing: 0.3 },
  row: { flexDirection: "row", alignItems: "baseline", gap: 10, marginTop: 6 },
  pct: { fontSize: 28, fontFamily: fontFamily.headingStrong, color: colors.brand, letterSpacing: -0.5 },
  hint: { flex: 1, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 18 },
  track: {
    marginTop: 12,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  fill: { height: "100%", borderRadius: radii.pill, backgroundColor: colors.teal },
});

/** Teal → brand rule used on blog, legal, and content tool screens. */
export function GshContentAccentBar({ style }: { style?: ViewStyle }) {
  return <View style={[{ height: 3, backgroundColor: colors.teal, marginBottom: 12 }, style]} />;
}

export function GshOutlineButton({
  title,
  onPress,
  style,
}: {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      style={[cardSurfaceStyle(false), outlineBtnStyles.btn, style]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={outlineBtnStyles.text}>{title}</Text>
    </Pressable>
  );
}

const outlineBtnStyles = StyleSheet.create({
  btn: {
    borderRadius: radii.pill,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.brand,
    paddingVertical: 14,
    alignItems: "center",
  },
  text: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.brand },
});

export function GshFilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[filterChipStyles.chip, active ? filterChipStyles.active : filterChipStyles.inactive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[filterChipStyles.label, active && filterChipStyles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const filterChipStyles = StyleSheet.create({
  chip: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  inactive: {
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  active: {
    borderColor: colors.teal,
    backgroundColor: colors.brandSoft,
  },
  label: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.navy },
  labelActive: { color: colors.navy },
});

/** Destination / expert name chips on light content screens. */
export function GshTopicChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      style={[topicChipStyles.chip, cardSurfaceStyle(true)]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={topicChipStyles.text}>{label}</Text>
    </Pressable>
  );
}

const topicChipStyles = StyleSheet.create({
  chip: { minHeight: 44, justifyContent: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill },
  text: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.brand },
});
```

## `components/CountryPicker.tsx` — CountryPicker

Searchable, localized, single/multi-select country field.

Key props: `label`, `hint`, `value`, `onChange`, `multiple`.

```tsx
import { useAppLanguage, toIntlLocale } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import countryOptions from "@/lib/country-options.json";
import { canonicalCountryCode } from "@/lib/countries";
import { colors, fontFamily } from "@/lib/theme";

export function CountryPicker({
  label,
  hint,
  value,
  onChange,
  multiple = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  multiple?: boolean;
}) {
  const ac = useAccountCopy();
  const locale = useAppLanguage((s) => s.locale);
  const intlLocale = toIntlLocale(locale);
  const countryName = (code: string) => {
    const fallback = countryOptions.find((c) => c.code === code)?.label || code;
    if (!/^[A-Z]{2}$/.test(code)) return fallback;
    try {
      return (
        new Intl.DisplayNames([intlLocale], { type: "region" }).of(code) ||
        fallback
      );
    } catch {
      return fallback;
    }
  };
  const normalise = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase(intlLocale);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = value
    .split(",")
    .map((v) => canonicalCountryCode(v) || v.trim())
    .filter(Boolean);
  const needle = normalise(query.trim());
  const exact = canonicalCountryCode(query);
  const choices = countryOptions
    .filter(
      (c) =>
        !selected.includes(c.code) &&
        (c.code === exact ||
          normalise(c.label).includes(needle) ||
          normalise(countryName(c.code)).includes(needle)),
    )
    .slice(0, 12);
  const choose = (code: string) => {
    onChange(multiple ? [...selected, code].join(", ") : code);
    setQuery("");
    setOpen(false);
  };
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          color: colors.navy,
          fontFamily: fontFamily.semiBold,
          fontSize: 14,
        }}
      >
        {label}
      </Text>
      {hint ? (
        <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18 }}>
          {hint}
        </Text>
      ) : null}
      {selected.map((code) => (
        <View
          key={code}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 12,
            borderRadius: 16,
            backgroundColor: colors.surfaceMuted,
          }}
        >
          <Text
            style={{
              flex: 1,
              color: colors.navy,
              fontFamily: fontFamily.regular,
            }}
          >
            {countryName(code)}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={ac("Remove {country}", {
              country: countryName(code),
            })}
            onPress={() =>
              onChange(selected.filter((v) => v !== code).join(", "))
            }
            style={{ minHeight: 44, justifyContent: "center" }}
          >
            <Text style={{ color: colors.navy }}>{ac("Remove")}</Text>
          </Pressable>
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={{ minHeight: 44, justifyContent: "center" }}
      >
        <Text style={{ color: colors.navy, textDecorationLine: "underline" }}>
          {open
            ? ac("Close country list")
            : selected.length && !multiple
              ? ac("Change country")
              : multiple
                ? ac("Add a country")
                : ac("Choose a country")}
        </Text>
      </Pressable>
      {open ? (
        <>
          <TextInput
            accessibilityLabel={ac("Search: {label}", {
              label: label.replace(/\s*\*$/, ""),
            })}
            placeholder={ac("Search country name")}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
            style={{
              minHeight: 52,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 12,
              color: colors.navy,
              fontSize: 16,
              fontFamily: fontFamily.regular,
            }}
          />
          {choices.map((c) => (
            <Pressable
              key={c.code}
              accessibilityRole="button"
              onPress={() => choose(c.code)}
              style={{
                minHeight: 44,
                justifyContent: "center",
                borderBottomWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.navy }}>{countryName(c.code)}</Text>
            </Pressable>
          ))}
          <Text
            accessibilityLiveRegion="polite"
            style={{ color: colors.textMuted, fontSize: 12 }}
          >
            {choices.length
              ? ac("Type more letters to narrow the list.")
              : ac("No matching country. Try another name.")}
          </Text>
        </>
      ) : null}
    </View>
  );
}
```

## `components/GshEmptyState.tsx` — GshEmptyState

Reusable branded/icon empty state with action.

Key props: `icon`, `title`, `actionLabel`, `onAction`, `useBrandMark`.

```tsx
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { brandMark } from "@/lib/brand-assets";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

export function GshEmptyState({
  icon,
  title,
  actionLabel,
  onAction,
  /** Prefer the GSH hub mark for brand-led empty surfaces. */
  useBrandMark = false,
}: {
  icon: IonName;
  title: string;
  actionLabel: string;
  onAction: () => void;
  useBrandMark?: boolean;
}) {
  return (
    <View style={[styles.wrap, feedCardStyle()]}>
      <View style={styles.iconCircle}>
        {useBrandMark ? (
          <Image
            source={brandMark}
            style={styles.mark}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Ionicons name={icon} size={32} color={colors.navy} />
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Pressable style={styles.btn} onPress={onAction} accessibilityRole="button">
        <Text style={styles.btnText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 28, paddingHorizontal: 20 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  mark: { width: 40, height: 40 },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  btn: {
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    backgroundColor: colors.navy,
  },
  btnText: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.white },
});
```
