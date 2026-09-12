import { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { useAppCopy } from "@/lib/i18n";
import faqCatalog from "@/lib/i18n/candidate-faqs.json";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FaqScreen() {
  const { locale } = useAppCopy();
  const content = faqCatalog[locale];
  const [open, setOpen] = useState<string | null>(null);
  const grouped = content.groups.map(
    (group) =>
      [
        group.title,
        group.items.map((item) => ({ question: item.q, answer: item.a })),
      ] as const,
  );

  function toggle(key: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => (prev === key ? null : key));
  }

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.pad}
          showsVerticalScrollIndicator={false}
        >
          <GshScreenIntro
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.intro}
            style={{ marginBottom: 8 }}
          />
          {grouped.map(([category, items], idx) => (
            <View key={category} style={styles.section}>
              <GshSectionTitle
                title={category}
                topSpacing={idx === 0 ? "none" : "sm"}
              />
              {items.map((item) => {
                const key = `${category}::${item.question}`;
                const isOpen = open === key;
                return (
                  <View key={key} style={[styles.card, cardSurfaceStyle(true)]}>
                    <Pressable
                      onPress={() => toggle(key)}
                      accessibilityRole="button"
                    >
                      <Text style={styles.q}>{item.question}</Text>
                      <Text style={styles.toggle}>
                        {isOpen ? "Hide" : "Show"}
                      </Text>
                    </Pressable>
                    {isOpen ? (
                      <Text style={styles.a}>{item.answer}</Text>
                    ) : null}
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
  q: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    paddingRight: 56,
  },
  toggle: {
    position: "absolute",
    right: 14,
    top: 14,
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
  },
  a: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 22,
  },
});
