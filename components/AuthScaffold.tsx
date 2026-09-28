import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, type ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DecorRing, PosterTitle } from "@/components/gsh-brand";
import { brandLockupWhite } from "@/lib/brand-assets";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { colors, fontFamily } from "@/lib/theme";

type Mode = "register" | "signin";

/** Navy onboarding frame shared by sign in and create account. */
export function AuthScaffold({
  mode,
  onSwitchMode,
  lead,
  highlight,
  subtitle,
  children,
  footer,
}: {
  mode?: Mode;
  onSwitchMode?: (mode: Mode) => void;
  lead?: string;
  highlight: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const router = useRouter();
  const ac = useAccountCopy();
  const canGoBack = router.canGoBack();

  return (
    <View style={styles.root}>
      <DecorRing size={320} thickness={46} color="rgba(66,224,227,0.1)" style={{ top: -140, right: -140 }} />
      <DecorRing size={220} thickness={30} color="rgba(255,255,255,0.05)" style={{ bottom: 60, left: -120 }} />
      <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topRow}>
              {canGoBack ? (
                <Pressable
                  onPress={() => router.back()}
                  style={styles.back}
                  accessibilityRole="button"
                  accessibilityLabel={ac("Back")}
                  hitSlop={6}
                >
                  <Ionicons name="chevron-back" size={22} color={colors.white} />
                </Pressable>
              ) : null}
              <Image
                source={brandLockupWhite}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="Global Sponsor Hub"
              />
            </View>

            <View style={styles.freePill}>
              <Ionicons name="sparkles" size={13} color={colors.cyan} />
              <Text style={styles.freeText}>{ac("Free for candidates")}</Text>
            </View>

            <PosterTitle lead={lead} highlight={highlight} onDark highlightTone="cyan" size={40} style={styles.title} />
            <Text style={styles.subtitle}>{subtitle}</Text>

            {mode && onSwitchMode ? (
              <View style={styles.switch} accessibilityRole="tablist">
                {(
                  [
                    ["register", ac("Create account")],
                    ["signin", ac("Sign in")],
                  ] as const
                ).map(([id, label]) => {
                  const active = mode === id;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => (active ? undefined : onSwitchMode(id))}
                      style={[styles.switchCell, active && styles.switchCellOn]}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: active }}
                    >
                      <Text style={[styles.switchText, active && styles.switchTextOn]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            <View style={styles.body}>{children}</View>
            {footer}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

export function AuthField({
  label,
  trailing,
  ...input
}: TextInputProps & { label: string; trailing?: ReactNode }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
        <TextInput
          {...input}
          accessibilityLabel={input.accessibilityLabel ?? label}
          placeholderTextColor="rgba(255,255,255,0.4)"
          selectionColor={colors.cyan}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          style={styles.input}
        />
        {trailing}
      </View>
    </View>
  );
}

export function AuthFeedback({ children }: { children: string }) {
  return (
    <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.feedback}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy, overflow: "hidden" },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 },
  topRow: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 180, height: 42 },
  freePill: {
    alignSelf: "flex-start",
    marginTop: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(66,224,227,0.14)",
  },
  freeText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.cyan },
  title: { marginTop: 16 },
  subtitle: {
    marginTop: 14,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.72)",
  },
  switch: {
    marginTop: 24,
    flexDirection: "row",
    padding: 5,
    gap: 4,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  switchCell: { flex: 1, minHeight: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  switchCellOn: { backgroundColor: colors.cyan, borderBottomWidth: 3, borderBottomColor: colors.navyDeep },
  switchText: { fontFamily: fontFamily.bold, fontSize: 13, color: "rgba(255,255,255,0.7)" },
  switchTextOn: { fontFamily: fontFamily.extraBold, color: colors.navy },
  body: { marginTop: 22 },
  field: { marginBottom: 16 },
  fieldLabel: {
    marginBottom: 8,
    fontFamily: fontFamily.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.75)",
  },
  inputWrap: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  inputWrapFocused: { borderColor: colors.cyan },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 15 : 12,
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: colors.white,
  },
  feedback: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255,241,242,0.95)",
    color: "#9f1239",
    fontFamily: fontFamily.medium,
    lineHeight: 21,
  },
});
