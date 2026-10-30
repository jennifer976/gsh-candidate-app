import { Feather, Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { GSH_MARK_PATH, GSH_MARK_VIEWBOX } from "@/lib/brand/gshMarkPath";
import { RiseIn } from "@/lib/motion";
import { cardSurfaceStyle, colors, fontFamily, shadows, type } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];
const TRAILING_ARROW = "arrow-up-right" as const;

/** Soft card surface. Depth prop kept for callers; values above 0 are ignored. */
export function DepthSurface({
  face = colors.white,
  depthColor: _depthColor = colors.navy,
  depth: _depth = 0,
  radius = 24,
  borderColor,
  borderWidth = 0,
  style,
  innerStyle,
  children,
}: {
  face?: string;
  depthColor?: string;
  depth?: number;
  radius?: number;
  borderColor?: string;
  borderWidth?: number;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  return (
    <View
      style={[
        cardSurfaceStyle(),
        { borderRadius: radius, backgroundColor: face, overflow: "hidden" },
        borderWidth ? { borderWidth, borderColor: borderColor ?? colors.line } : null,
        style,
        innerStyle,
      ]}
    >
      {children}
    </View>
  );
}

/** Soft card that scales to 0.97 on press. Depth prop kept for callers; ignored above 0. */
export function DepthPressable({
  onPress,
  face = colors.white,
  depthColor: _depthColor = colors.navy,
  depth: _depth = 0,
  radius = 24,
  borderColor,
  borderWidth = 0,
  style,
  innerStyle,
  disabled,
  selected,
  accessibilityLabel,
  accessibilityRole = "button",
  children,
}: {
  onPress: () => void;
  face?: string;
  depthColor?: string;
  depth?: number;
  radius?: number;
  borderColor?: string;
  borderWidth?: number;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  selected?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: "button" | "link" | "radio";
  children: ReactNode;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        if (disabled) return;
        scale.value = withTiming(0.97, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{
        disabled: Boolean(disabled),
        selected,
        checked: accessibilityRole === "radio" ? Boolean(selected) : undefined,
      }}
      style={style}
    >
      <Animated.View
        style={[
          cardSurfaceStyle(),
          {
            borderRadius: radius,
            backgroundColor: face,
            overflow: "hidden",
            opacity: disabled ? 0.55 : 1,
          },
          borderWidth ? { borderWidth, borderColor: borderColor ?? colors.line } : null,
          innerStyle,
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

type ResolvedButton = {
  bg: string;
  text: string;
  borderWidth: number;
  borderColor: string;
  trailingCyan: boolean;
};

function resolveButtonVariant(
  variant: string,
): ResolvedButton {
  // Map legacy cyan fill to navy primary.
  if (variant === "cyan" || variant === "navy" || variant === "navyOnLight") {
    return {
      bg: colors.navy,
      text: colors.white,
      borderWidth: 0,
      borderColor: "transparent",
      trailingCyan: true,
    };
  }
  if (variant === "cyanOnNavy") {
    return {
      bg: colors.white,
      text: colors.navy,
      borderWidth: 0,
      borderColor: "transparent",
      trailingCyan: false,
    };
  }
  // secondary / ghost / outline / white
  return {
    bg: colors.white,
    text: colors.navy,
    borderWidth: 1,
    borderColor: colors.line,
    trailingCyan: false,
  };
}

export type DepthButtonVariant =
  | "navy"
  | "secondary"
  | "cyanOnNavy"
  | "cyan"
  | "white"
  | "ghost"
  | "outline"
  | "navyOnLight";

export function DepthButton({
  title,
  onPress,
  variant = "navy",
  icon = TRAILING_ARROW,
  leadingIcon,
  size = "lg",
  disabled,
  loading,
  bordered: _bordered,
  accessibilityLabel,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: DepthButtonVariant;
  /** Ionicons name, Feather "arrow-up-right", or null to hide the trailing icon. */
  icon?: IonName | typeof TRAILING_ARROW | null;
  leadingIcon?: IonName;
  size?: "lg" | "md" | "sm";
  disabled?: boolean;
  loading?: boolean;
  bordered?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const v = resolveButtonVariant(variant);
  const height = size === "lg" ? 52 : size === "md" ? 48 : 40;
  const fontSize = size === "lg" ? 16 : size === "md" ? 15 : 13;
  const showTrailing = icon !== null;
  const trailingColor = v.trailingCyan ? colors.cyan : v.text;
  const useFeatherArrow = icon === TRAILING_ARROW || icon === undefined;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: Boolean(disabled || loading) }}
      style={({ pressed }) => [
        styles.buttonFace,
        {
          minHeight: height,
          backgroundColor: v.bg,
          borderWidth: v.borderWidth,
          borderColor: v.borderColor,
          opacity: disabled || loading ? 0.55 : pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          paddingHorizontal: size === "sm" ? 14 : 18,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <>
          {leadingIcon ? <Ionicons name={leadingIcon} size={18} color={v.text} /> : null}
          <Text
            style={[styles.buttonText, { color: v.text, fontSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {title}
          </Text>
          {showTrailing ? (
            useFeatherArrow ? (
              <Feather name={TRAILING_ARROW} size={18} color={trailingColor} />
            ) : (
              <Ionicons name={icon as IonName} size={18} color={trailingColor} />
            )
          ) : null}
        </>
      )}
    </Pressable>
  );
}

/** Splits "Lead|Highlight" copy so each language can choose its own line break and word agreement. */
export function posterParts(text: string): { lead?: string; highlight: string } {
  const [lead, highlight] = text.split("|");
  return highlight === undefined ? { highlight: lead } : { lead, highlight };
}

export function PosterTitle({
  lead,
  highlight,
  onDark = false,
  highlightTone: _highlightTone = "navy",
  size = 34,
  align = "left",
  tone,
  style,
}: {
  lead?: string;
  highlight: string;
  onDark?: boolean;
  highlightTone?: "navy" | "cyan";
  size?: number;
  align?: "left" | "center";
  tone?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const leadText = (lead ?? "").trim();
  const highlightText = highlight.trim();
  const combined = [leadText, highlightText].filter(Boolean).join(" ");
  const endsWithPunct = /[.?!]$/.test(combined);
  const titleStyle: TextStyle = {
    ...type.title,
    fontSize: size,
    lineHeight: Math.round(size * (36 / 34)),
    color: onDark ? colors.white : colors.navy,
    textAlign: align,
  };

  return (
    <View
      style={[{ alignItems: align === "center" ? "center" : "flex-start" }, style]}
      accessibilityRole="header"
      accessible
      accessibilityLabel={combined}
    >
      <Text style={titleStyle}>
        {leadText ? `${leadText} ` : null}
        {highlightText}
        {tone ? <Text style={{ color: colors.tone }}>{` ${tone}`}</Text> : null}
        {!endsWithPunct ? <Text style={{ color: colors.cyan }}>.</Text> : null}
      </Text>
    </View>
  );
}

export function Eyebrow({
  children,
  onDark,
  color,
}: {
  children: string;
  onDark?: boolean;
  color?: string;
}) {
  return (
    <View style={styles.eyebrowRow}>
      <View style={styles.eyebrowBar} />
      <Text
        style={[
          styles.eyebrow,
          { color: color ?? (onDark ? colors.onNavy2 : colors.text2) },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  actionLabel,
  onAction,
  onDark = false,
  style,
}: {
  eyebrow?: string;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  onDark?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionRow, style]}>
      <View style={styles.sectionText}>
        {eyebrow ? <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow> : null}
        <Text style={[type.section, onDark && { color: colors.white }]} accessibilityRole="header">
          {title}
        </Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} style={styles.sectionAction} accessibilityRole="button">
          <Text style={[styles.sectionActionText, onDark && { color: colors.cyan }]}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={onDark ? colors.cyan : colors.navy} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** Filter / collection chip: off white with border; on = navy fill, white text. */
export function BrandChip({
  label,
  selected = false,
  onPress,
  icon,
  solid = false,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: IonName;
  /** Always render as the selected (navy) state. */
  solid?: boolean;
}) {
  const on = selected || solid;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      style={[styles.chipInner, on ? styles.chipOn : styles.chipOff]}
    >
      {icon ? <Ionicons name={icon} size={15} color={on ? colors.white : colors.navy} /> : null}
      <Text style={on ? styles.chipTextOn : styles.chipTextOff} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SegmentTabs<T extends string>({
  options,
  value,
  onChange,
  onCyan = false,
  style,
}: {
  options: Array<{ id: T; label: string }>;
  value: T;
  onChange: (id: T) => void;
  onCyan?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.segment, onCyan && styles.segmentOnCyan, style]} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => {
              onChange(option.id);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.segmentCell, active && styles.segmentCellOn]}
          >
            <Text
              style={[styles.segmentText, active && styles.segmentTextOn]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Kept so imports compile; Part 3 removes call sites. */
export function DecorRing(_props: {
  size: number;
  thickness: number;
  color: string;
  style: ViewStyle;
}) {
  return null;
}

export function IconBadge({
  icon,
  face,
  color,
  size = 40,
  radius = 12,
  onNavy = false,
}: {
  icon: IonName;
  face?: string;
  color?: string;
  size?: number;
  radius?: number;
  onNavy?: boolean;
}) {
  const bg = face ?? (onNavy ? "rgba(255,255,255,0.08)" : colors.panel);
  const iconColor = color ?? (onNavy ? colors.cyan : colors.navy);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
  );
}

/** Settings-style row: white soft card with an icon badge, label, optional hint and chevron. */
export function BrandLinkRow({
  icon,
  label,
  hint,
  onPress,
  onDark = false,
  style,
}: {
  icon: IonName;
  label: string;
  hint?: string;
  onPress: () => void;
  onDark?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <DepthPressable
      onPress={onPress}
      face={onDark ? "rgba(255,255,255,0.08)" : colors.white}
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
      style={style}
      innerStyle={styles.linkRow}
      radius={16}
    >
      <IconBadge icon={icon} onNavy={onDark} />
      <View style={styles.linkText}>
        <Text style={[styles.linkLabel, onDark && { color: colors.white }]} numberOfLines={2}>
          {label}
        </Text>
        {hint ? (
          <Text style={[styles.linkHint, onDark && { color: colors.onNavy2 }]} numberOfLines={2}>
            {hint}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </DepthPressable>
  );
}

type StateAction = { label: string; onPress: () => void; variant?: DepthButtonVariant; icon?: IonName | null };

/** One pattern for empty, error, offline and signed-out screens: badge, headline, one line, one next step. */
export function BrandStatePanel({
  icon,
  title,
  body,
  tone = "white",
  primary,
  secondary,
  style,
}: {
  icon: IonName;
  title: string;
  body: string;
  tone?: "white" | "cyan" | "navy";
  primary?: StateAction;
  secondary?: StateAction;
  style?: StyleProp<ViewStyle>;
}) {
  const onNavy = tone === "navy";
  const primaryVariant: DepthButtonVariant = onNavy ? "cyanOnNavy" : "navy";
  return (
    <View style={[styles.state, style]}>
      <IconBadge icon={icon} size={72} radius={24} face={onNavy ? "rgba(255,255,255,0.08)" : colors.panel} color={onNavy ? colors.cyan : colors.navy} />
      <Text style={[styles.stateTitle, onNavy && { color: colors.white }]} accessibilityRole="header">
        {title}
      </Text>
      <Text
        style={[
          styles.stateBody,
          { color: onNavy ? colors.onNavy2 : colors.text2 },
        ]}
      >
        {body}
      </Text>
      {primary ? (
        <DepthButton
          title={primary.label}
          onPress={primary.onPress}
          variant={primary.variant ?? primaryVariant}
          icon={primary.icon === undefined ? TRAILING_ARROW : primary.icon}
          size="md"
          style={styles.stateButton}
        />
      ) : null}
      {secondary ? (
        <Pressable onPress={secondary.onPress} accessibilityRole="button" style={styles.stateSecondary} hitSlop={6}>
          <Text style={[styles.stateSecondaryText, onNavy && { color: colors.cyan }]}>{secondary.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function SupportChip({ label, onNavy = false }: { label: string; onNavy?: boolean }) {
  return (
    <View
      style={[
        styles.supportChip,
        {
          backgroundColor: onNavy ? colors.supportChipBgOnNavy : colors.supportChipBg,
        },
      ]}
    >
      <View style={styles.supportDot} />
      <Text style={[styles.supportText, onNavy && { color: colors.white }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function PlainTag({ label }: { label: string }) {
  return (
    <View style={styles.plainTag}>
      <Text style={styles.supportText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function TitleWithStop({
  text,
  eyebrow,
  tone,
}: {
  text: string;
  eyebrow?: string;
  tone?: string;
}) {
  const endsWithPunct = /[.?!]$/.test(text);
  return (
    <View accessibilityRole="header">
      {eyebrow ? (
        <View style={{ marginBottom: 6 }}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </View>
      ) : null}
      <Text style={type.title} allowFontScaling>
        {text}
        {tone ? <Text style={{ color: colors.tone }}>{` ${tone}`}</Text> : null}
        {!endsWithPunct ? <Text style={{ color: colors.cyan }}>.</Text> : null}
      </Text>
    </View>
  );
}

export function StatChip({ value, label }: { value: string; label: string }) {
  return (
    <View style={[styles.statChip, shadows.lift]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function TalentMovesLockup({ size = 66 }: { size?: number }) {
  const letterSpacing = -0.035 * size;
  // 0.9 can clip letter tops on Android; 0.94 keeps the tight lockup readable.
  const lineHeight = 0.94 * size;
  const boxRadius = size * 0.192;

  return (
    <View accessibilityLabel="Talent moves." accessible>
      <RiseIn delay={50}>
        <Text
          importantForAccessibility="no-hide-descendants"
          style={{
            fontFamily: fontFamily.headingStrong,
            fontSize: size,
            lineHeight,
            letterSpacing,
            color: colors.navy,
            includeFontPadding: false,
          }}
        >
          TALENT
        </Text>
      </RiseIn>
      <RiseIn delay={160}>
        <View
          style={{
            alignSelf: "flex-start",
            marginTop: size * 0.04,
            borderRadius: boxRadius,
            backgroundColor: colors.navy,
            paddingTop: size * 0.058,
            paddingHorizontal: size * 0.192,
            paddingBottom: size * 0.135,
          }}
        >
          <Text
            importantForAccessibility="no-hide-descendants"
            style={{
              fontFamily: fontFamily.headingStrong,
              fontSize: size,
              lineHeight,
              letterSpacing,
              color: colors.white,
              includeFontPadding: false,
            }}
          >
            MOVES
            <Text style={{ color: colors.cyan }}>.</Text>
          </Text>
        </View>
      </RiseIn>
    </View>
  );
}

export function GshMark({
  size,
  color = "#dfe3ec",
  style,
}: {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={GSH_MARK_VIEWBOX}
      style={style}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path d={GSH_MARK_PATH} fill={color} fillRule="evenodd" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  buttonFace: {
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    fontFamily: fontFamily.semiBold,
    letterSpacing: 0,
    textTransform: "none",
    flexShrink: 1,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eyebrowBar: {
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.cyan,
  },
  eyebrow: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionText: { flex: 1, minWidth: 0, gap: 6 },
  sectionAction: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 2 },
  sectionActionText: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.navy },
  chipInner: {
    minHeight: 44,
    height: 44,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 9999,
  },
  chipOff: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  chipOn: {
    backgroundColor: colors.navy,
  },
  chipTextOn: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.white },
  chipTextOff: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.navy },
  segment: {
    flexDirection: "row",
    padding: 5,
    borderRadius: 16,
    backgroundColor: colors.panel,
    gap: 4,
  },
  segmentOnCyan: { backgroundColor: "rgba(255,255,255,0.5)" },
  segmentCell: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  segmentCellOn: {
    backgroundColor: colors.navy,
  },
  segmentText: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.text2 },
  segmentTextOn: { fontFamily: fontFamily.semiBold, color: colors.white },
  linkRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  linkText: { flex: 1, minWidth: 0 },
  linkLabel: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.navy },
  linkHint: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 17, color: colors.text2 },
  state: { alignItems: "center", paddingHorizontal: 28, paddingVertical: 32 },
  stateTitle: {
    marginTop: 24,
    fontFamily: fontFamily.headingStrong,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.6,
    color: colors.navy,
    textAlign: "center",
  },
  stateBody: {
    marginTop: 10,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 320,
  },
  stateButton: { marginTop: 22, alignSelf: "stretch" },
  stateSecondary: { minHeight: 44, justifyContent: "center", marginTop: 6 },
  stateSecondaryText: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.navy },
  supportChip: {
    height: 28,
    borderRadius: 9999,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
  },
  supportDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.cyan,
  },
  supportText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.navy,
  },
  plainTag: {
    height: 28,
    borderRadius: 9999,
    paddingHorizontal: 11,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  statChip: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  statValue: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 22,
    lineHeight: 24,
    color: colors.navy,
  },
  statLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.text2,
  },
});
