import { useMemo, useState } from "react";
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { FAQ_ITEMS } from "@/lib/content/faqData";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FaqScreen() {
  const [open, setOpen] = useState<string | null>(null);
  const grouped = useMemo(() => {
    const m = new Map<string, typeof FAQ_ITEMS>();
    for (const item of FAQ_ITEMS) {
      const list = m.get(item.category) ?? [];
      list.push(item);
      m.set(item.category, list);
    }
    return [...m.entries()];
  }, []);

  function toggle(key: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => (prev === key ? null : key));
  }

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <GshScreenIntro
            eyebrow="Help"
            title="FAQs"
            subtitle="Answers about Global Sponsor Hub — formatted for quick reading on mobile."
            style={{ marginBottom: 8 }}
          />
          {grouped.map(([category, items], idx) => (
            <View key={category} style={styles.section}>
              <GshSectionTitle title={category} topSpacing={idx === 0 ? "none" : "sm"} />
              {items.map((item) => {
                const key = `${category}::${item.question}`;
                const isOpen = open === key;
                return (
                  <View key={key} style={[styles.card, cardSurfaceStyle(true)]}>
                    <Pressable onPress={() => toggle(key)} accessibilityRole="button">
                      <Text style={styles.q}>{item.question}</Text>
                      <Text style={styles.toggle}>{isOpen ? "Hide" : "Show"}</Text>
                    </Pressable>
                    {isOpen ? <Text style={styles.a}>{item.answer}</Text> : null}
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, gap: 16 },
  section: { gap: 10 },
  card: { padding: 14, borderRadius: radii.lg },
  q: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.navy, paddingRight: 56 },
  toggle: {
    position: "absolute",
    right: 14,
    top: 14,
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
  },
  a: { marginTop: 12, fontSize: 15, fontFamily: fontFamily.regular, color: colors.textMarketing, lineHeight: 22 },
});
