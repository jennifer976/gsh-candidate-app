import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppCopy, useAppLanguage } from "@/lib/i18n";
import { APP_LANGUAGES } from "@/lib/i18n/catalog";
import { colors, fontFamily, radii } from "@/lib/theme";

export function AppLanguageSetting() {
  const { t, locale } = useAppCopy();
  const setLocale = useAppLanguage((state) => state.setLocale);
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        style={styles.row}
      >
        <View style={styles.copy}>
          <Text style={styles.title}>{t("language")}</Text>
          <Text style={styles.body}>
            {APP_LANGUAGES.find((item) => item.code === locale)?.name}
          </Text>
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          color={colors.accent}
          size={22}
        />
      </Pressable>
      {open && (
        <View>
          <Text style={styles.help}>{t("languageHelp")}</Text>
          <Text style={styles.help}>{t("partial")}</Text>
          {APP_LANGUAGES.map((item) => (
            <Pressable
              key={item.code}
              accessibilityRole="radio"
              accessibilityState={{ checked: locale === item.code }}
              onPress={() => {
                setLocale(item.code);
                setOpen(false);
              }}
              style={[styles.option, locale === item.code && styles.selected]}
            >
              <Text style={styles.title}>{item.name}</Text>
              {locale === item.code && (
                <Ionicons name="checkmark" size={21} color={colors.navy} />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    marginVertical: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 64,
    padding: 16,
    gap: 12,
  },
  copy: { flex: 1 },
  title: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.navy },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  help: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  selected: { backgroundColor: colors.accent },
});
