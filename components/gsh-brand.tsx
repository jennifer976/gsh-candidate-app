import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { colors, fontFamily } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

function tick() {
  if (Platform.OS === "web") return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

/** Solid bottom edge that reads as a pressable slab (website/Duolingo-style depth). */
export function DepthSurface({
  face = colors.white,
  depthColor = colors.navy,
  depth = 5,
  radius = 22,
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
    <View style={[{ borderRadius: radius, backgroundColor: depthColor, paddingBottom: depth }, style]}>
      <View
        style={[
          { borderRadius: radius, backgroundColor: face, overflow: "hidden" },
          borderWidth ? { borderWidth, borderColor: borderColor ?? depthColor } : null,
          innerStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

/** DepthSurface that presses down on tap. */
export function DepthPressable({
  onPress,
  face = colors.white,
  depthColor = colors.navy,
  depth = 5,
  radius = 22,
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
  return (
    <Pressable
      onPress={onPress}
      onPressIn={disabled ? undefined : tick}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled), selected, checked: accessibilityRole === "radio" ? Boolean(selected) : undefined }}
      style={style}
    >
      {({ pressed }) => (
        <View
          style={{
            borderRadius: radius,
            backgroundColor: depthColor,
            paddingBottom: pressed ? 0 : depth,
            marginTop: pressed ? depth : 0,
            opacity: disabled ? 0.55 : 1,
          }}
        >
          <View
            style={[
              { borderRadius: radius, backgroundColor: face, overflow: "hidden" },
              borderWidth ? { borderWidth, borderColor: borderColor ?? depthColor } : null,
              innerStyle,
            ]}
          >
            {children}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const BUTTON_VARIANTS = {
  cyan: { face: colors.cyan, depth: colors.navy, text: colors.navy, icon: colors.navy },
  cyanOnNavy: { face: colors.cyan, depth: colors.navyDeep, text: colors.navy, icon: colors.navy },
  navy: { face: colors.navy, depth: colors.navyDeep, text: colors.white, icon: colors.cyan },
  navyOnLight: { face: colors.navy, depth: colors.cyan, text: colors.white, icon: colors.cyan },
  white: { face: colors.white, depth: colors.navy, text: colors.navy, icon: colors.navy },
} as const;

export type DepthButtonVariant = keyof typeof BUTTON_VARIANTS;

export function DepthButton({
  title,
  onPress,
  variant = "cyan",
  icon = "arrow-forward",
  leadingIcon,
  size = "lg",
  disabled,
  loading,
  bordered,
  accessibilityLabel,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: DepthButtonVariant;
  icon?: IonName | null;
  leadingIcon?: IonName;
  size?: "lg" | "md" | "sm";
  disabled?: boolean;
  loading?: boolean;
  bordered?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const v = BUTTON_VARIANTS[variant];
  const height = size === "lg" ? 56 : size === "md" ? 48 : 40;
  const depth = size === "sm" ? 3 : size === "md" ? 4 : 5;
  const fontSize = size === "lg" ? 15 : size === "md" ? 14 : 12;
  return (
    <DepthPressable
      onPress={onPress}
      disabled={disabled || loading}
      face={v.face}
      depthColor={v.depth}
      depth={depth}
      radius={size === "sm" ? 999 : 18}
      borderWidth={bordered ? 2 : 0}
      borderColor={colors.navy}
      accessibilityLabel={accessibilityLabel ?? title}
      style={style}
      innerStyle={[styles.buttonInner, { minHeight: height, paddingHorizontal: size === "sm" ? 14 : 18 }]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <>
          {leadingIcon ? <Ionicons name={leadingIcon} size={fontSize + 3} color={v.icon} /> : null}
          <Text
            style={[styles.buttonText, { color: v.text, fontSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {title}
          </Text>
          {icon ? <Ionicons name={icon} size={fontSize + 3} color={v.icon} /> : null}
        </>
      )}
    </DepthPressable>
  );
}

/** Uppercase poster headline with a highlighted block word, as on the website. */
/** Splits "Lead|Highlight" copy so each language can choose its own line break and word agreement. */
export function posterParts(text: string): { lead?: string; highlight: string } {
  const [lead, highlight] = text.split("|");
  return highlight === undefined ? { highlight: lead } : { lead, highlight };
}

export function PosterTitle({
  lead,
  highlight,
  onDark = false,
  highlightTone = "navy",
  size = 36,
  align = "left",
  style,
}: {
  lead?: string;
  highlight: string;
  onDark?: boolean;
  highlightTone?: "navy" | "cyan";
  size?: number;
  align?: "left" | "center";
  style?: StyleProp<ViewStyle>;
}) {
  const lineHeight = Math.round(size * 0.98);
  const blockBg = highlightTone === "navy" ? colors.navy : colors.cyan;
  const blockText = highlightTone === "navy" ? colors.cyan : colors.navy;
  return (
    <View
      style={[{ alignItems: align === "center" ? "center" : "flex-start" }, style]}
      accessibilityRole="header"
      accessible
      accessibilityLabel={[lead, highlight].filter(Boolean).join(" ")}
    >
      {lead ? (
        <Text
          style={[
            styles.poster,
            { fontSize: size, lineHeight, color: onDark ? colors.white : colors.navy, textAlign: align },
          ]}
        >
          {lead}
        </Text>
      ) : null}
      <View style={[styles.posterBlock, { backgroundColor: blockBg, marginTop: lead ? 4 : 0 }]}>
        <Text style={[styles.poster, { fontSize: size, lineHeight, color: blockText }]}>{highlight}</Text>
      </View>
    </View>
  );
}

export function Eyebrow({ children, onDark, color }: { children: string; onDark?: boolean; color?: string }) {
  return (
    <Text style={[styles.eyebrow, { color: color ?? (onDark ? colors.cyan : colors.textMuted) }]}>
      {children}
    </Text>
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
        <Text style={[styles.sectionTitle, onDark && { color: colors.white }]} accessibilityRole="header">
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

/** Filter / collection chip: selected chips get the cyan slab with a navy edge. */
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
  /** Always render as the cyan slab (collection shortcuts). */
  solid?: boolean;
}) {
  const on = selected || solid;
  if (on) {
    const shownIcon: IonName | undefined = icon ?? (selected ? "checkmark-circle" : undefined);
    return (
      <DepthPressable
        onPress={onPress}
        face={colors.cyan}
        depthColor={colors.navy}
        depth={3}
        radius={999}
        borderWidth={2}
        accessibilityLabel={label}
        innerStyle={styles.chipInner}
      >
        {shownIcon ? <Ionicons name={shownIcon} size={15} color={colors.navy} /> : null}
        <Text style={styles.chipTextOn} numberOfLines={1}>
          {label}
        </Text>
      </DepthPressable>
    );
  }
  return (
    <Pressable
      onPress={() => {
        tick();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: false }}
      style={[styles.chipInner, styles.chipOff]}
    >
      {icon ? <Ionicons name={icon} size={15} color={colors.navy} /> : null}
      <Text style={styles.chipTextOff} numberOfLines={1}>
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
              if (!active) tick();
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

/** Soft ring motif from the website hero, placed absolutely behind content. */
export function DecorRing({
  size,
  thickness,
  color,
  style,
}: {
  size: number;
  thickness: number;
  color: string;
  style: ViewStyle;
}) {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: thickness,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

export function IconBadge({
  icon,
  face = colors.cyan,
  color = colors.navy,
  size = 40,
  radius = 12,
}: {
  icon: IonName;
  face?: string;
  color?: string;
  size?: number;
  radius?: number;
}) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: face, alignItems: "center", justifyContent: "center" }}>
      <Ionicons name={icon} size={Math.round(size * 0.5)} color={color} />
    </View>
  );
}

/** Settings-style row: white slab with an icon badge, label, optional hint and chevron. */
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
      depthColor={onDark ? colors.navyDeep : colors.navy}
      depth={3}
      radius={16}
      borderWidth={2}
      borderColor={onDark ? "rgba(255,255,255,0.14)" : colors.navy}
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
      style={style}
      innerStyle={styles.linkRow}
    >
      <IconBadge icon={icon} size={36} radius={11} face={onDark ? colors.cyan : colors.pale} />
      <View style={styles.linkText}>
        <Text style={[styles.linkLabel, onDark && { color: colors.white }]} numberOfLines={2}>
          {label}
        </Text>
        {hint ? (
          <Text style={[styles.linkHint, onDark && { color: "rgba(255,255,255,0.65)" }]} numberOfLines={2}>
            {hint}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={onDark ? colors.cyan : colors.navy} />
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
  const badgeFace = tone === "white" ? colors.cyan : tone === "cyan" ? colors.navy : colors.cyan;
  const badgeIcon = tone === "cyan" ? colors.cyan : colors.navy;
  const badgeDepth = tone === "white" ? colors.navy : colors.navyDeep;
  const primaryVariant: DepthButtonVariant = tone === "cyan" ? "navy" : onNavy ? "cyanOnNavy" : "cyan";
  return (
    <View style={[styles.state, style]}>
      <DepthSurface face={badgeFace} depthColor={badgeDepth} depth={6} radius={28}>
        <View style={styles.stateBadge}>
          <Ionicons name={icon} size={42} color={badgeIcon} />
        </View>
      </DepthSurface>
      <Text style={[styles.stateTitle, onNavy && { color: colors.white }]} accessibilityRole="header">
        {title}
      </Text>
      <Text
        style={[
          styles.stateBody,
          { color: onNavy ? "rgba(255,255,255,0.72)" : tone === "cyan" ? "rgba(13,25,78,0.78)" : colors.textMuted },
        ]}
      >
        {body}
      </Text>
      {primary ? (
        <DepthButton
          title={primary.label}
          onPress={primary.onPress}
          variant={primary.variant ?? primaryVariant}
          icon={primary.icon === undefined ? "arrow-forward" : primary.icon}
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

const styles = StyleSheet.create({
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    fontFamily: fontFamily.heading,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    flexShrink: 1,
  },
  poster: {
    fontFamily: fontFamily.headingStrong,
    textTransform: "uppercase",
    letterSpacing: -1.2,
  },
  posterBlock: { paddingHorizontal: 8, paddingBottom: 3, paddingTop: 1 },
  eyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  sectionRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionText: { flex: 1, minWidth: 0, gap: 2 },
  sectionTitle: {
    fontFamily: fontFamily.heading,
    fontSize: 20,
    lineHeight: 25,
    color: colors.navy,
    letterSpacing: -0.4,
  },
  sectionAction: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 2 },
  sectionActionText: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.navy },
  chipInner: {
    minHeight: 40,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipOff: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginBottom: 3,
  },
  chipTextOn: { fontFamily: fontFamily.extraBold, fontSize: 12, color: colors.navy },
  chipTextOff: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.navy },
  segment: {
    flexDirection: "row",
    padding: 5,
    borderRadius: 16,
    backgroundColor: colors.pale,
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
    borderBottomWidth: 3,
    borderBottomColor: colors.navyDeep,
  },
  segmentText: { fontFamily: fontFamily.bold, fontSize: 12, color: "rgba(13,25,78,0.6)" },
  segmentTextOn: { fontFamily: fontFamily.extraBold, color: colors.cyan },
  linkRow: { minHeight: 60, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, paddingVertical: 10 },
  linkText: { flex: 1, minWidth: 0 },
  linkLabel: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.navy },
  linkHint: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 17, color: colors.textMuted },
  state: { alignItems: "center", paddingHorizontal: 28, paddingVertical: 32 },
  stateBadge: { width: 92, height: 92, alignItems: "center", justifyContent: "center" },
  stateTitle: {
    marginTop: 24,
    fontFamily: fontFamily.headingStrong,
    fontSize: 24,
    lineHeight: 25,
    letterSpacing: -0.6,
    textTransform: "uppercase",
    color: colors.navy,
    textAlign: "center",
  },
  stateBody: {
    marginTop: 10,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 320,
  },
  stateButton: { marginTop: 22, alignSelf: "stretch" },
  stateSecondary: { minHeight: 44, justifyContent: "center", marginTop: 6 },
  stateSecondaryText: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.navy },
});
