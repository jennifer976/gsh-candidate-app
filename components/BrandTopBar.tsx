import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppCopy } from "@/lib/i18n";
import { colors } from "@/lib/theme";

/** Replaces the native stack header on full-bleed brand screens. */
export function BrandTopBar({
  onDark = false,
  right,
  fallback = "/(tabs)/home",
}: {
  onDark?: boolean;
  right?: ReactNode;
  fallback?: Href;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useAppCopy();
  return (
    <View style={[styles.bar, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))}
        hitSlop={6}
        style={[styles.button, onDark ? styles.buttonDark : styles.buttonLight]}
        accessibilityRole="button"
        accessibilityLabel={t("detailBack")}
      >
        <Ionicons name="arrow-back" size={20} color={onDark ? colors.white : colors.navy} />
      </Pressable>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDark: { borderColor: "rgba(255,255,255,0.35)", backgroundColor: "rgba(255,255,255,0.08)" },
  buttonLight: { borderColor: colors.navy, backgroundColor: colors.white },
});
