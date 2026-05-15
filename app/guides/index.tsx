import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshLinkRow, GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { listCountryVisaGuideSummaries } from "@/lib/guides/countryVisaGuides";
import { navigateGuideLink } from "@/lib/guides/navigateGuideLink";
import { RELOCATION_RESOURCES_NAV_LINKS, SEO_PILLAR_NAV_LINKS } from "@/lib/guides/seoGuideNav";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function GuidesHubScreen() {
  const router = useRouter();
  const countries = listCountryVisaGuideSummaries();
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <GshScreenIntro
            eyebrow="Guides"
            title="Resources hub"
            subtitle="Visa wizard, topics, and country write-ups — all in the app."
            style={{ marginBottom: 8 }}
          />

          <GshSectionTitle title="Visa orientation" topSpacing="none" />
          <GshLinkRow
            title="Visa wizard"
            subtitle="Checklist for sponsorship routes"
            icon="sparkles-outline"
            accent="teal"
            onPress={() => router.push("/visa-wizard")}
          />

          <GshSectionTitle title="Topics" hint="Long reads" />
          {SEO_PILLAR_NAV_LINKS.map((g) => (
            <Pressable
              key={g.href}
              style={[styles.pillarTile, cardSurfaceStyle(true)]}
              onPress={() => router.push({ pathname: "/guides/topic", params: { q: encodeURIComponent(g.href) } })}
              accessibilityRole="button"
            >
              <View style={styles.pillarAccent} />
              <View style={styles.pillarBody}>
                <Text style={styles.pillarTitle}>{g.label}</Text>
                <Text style={styles.pillarCta}>Open</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.brand} />
            </Pressable>
          ))}

          <GshSectionTitle title="Country guides" hint="Pick a destination" />
          <Pressable
            style={[styles.countryPicker, cardSurfaceStyle(true)]}
            onPress={() => setCountryPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Choose country guide"
          >
            <View style={styles.countryPickerIcon}>
              <Ionicons name="earth-outline" size={22} color={colors.teal} />
            </View>
            <View style={styles.countryPickerText}>
              <Text style={styles.countryPickerTitle}>Choose country</Text>
              <Text style={styles.countryPickerSub} numberOfLines={2}>
                {countries.map((c) => c.countryLabel).join(" · ")}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={22} color={colors.navy} />
          </Pressable>

          <GshSectionTitle title="Move safely" />
          {RELOCATION_RESOURCES_NAV_LINKS.map((g) => (
            <Pressable
              key={g.href}
              style={[styles.pillarTile, cardSurfaceStyle(true)]}
              onPress={() => router.push({ pathname: "/guides/topic", params: { q: encodeURIComponent(g.href) } })}
              accessibilityRole="button"
            >
              <View style={[styles.pillarAccent, styles.pillarAccentPurple]} />
              <View style={styles.pillarBody}>
                <Text style={styles.pillarTitle}>{g.label}</Text>
                <Text style={styles.pillarCta}>Open</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.brand} />
            </Pressable>
          ))}

          <GshSectionTitle title="More" />
          <GshLinkRow
            title="Tools & resources"
            subtitle="Blog, FAQs, legal"
            icon="library-outline"
            accent="purple"
            onPress={() => router.push("/tools-resources")}
          />
          <GshLinkRow
            title="Partner directory"
            subtitle="Mobility & legal firms"
            icon="people-outline"
            accent="teal"
            onPress={() => navigateGuideLink(router, "/partners/directory")}
          />
          <Pressable style={styles.inlineBtn} onPress={() => navigateGuideLink(router, "/jobs")} accessibilityRole="button">
            <Text style={styles.inlineBtnText}>Discover jobs</Text>
          </Pressable>
        </ScrollView>

        <Modal visible={countryPickerOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setCountryPickerOpen(false)}>
          <SafeAreaView style={styles.modalSafe} edges={["top", "bottom"]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Country guides</Text>
              <Pressable onPress={() => setCountryPickerOpen(false)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
                <Text style={styles.modalDone}>Done</Text>
              </Pressable>
            </View>
            <FlatList
              data={countries}
              keyExtractor={(item) => item.slug}
              contentContainerStyle={styles.modalList}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.modalRow, cardSurfaceStyle(false)]}
                  onPress={() => {
                    setCountryPickerOpen(false);
                    router.push(`/guides/country/${item.slug}`);
                  }}
                  accessibilityRole="button"
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.modalRowEyebrow}>{item.countryLabel}</Text>
                    <Text style={styles.modalRowTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </Pressable>
              )}
            />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 16, paddingBottom: 48, gap: 12 },
  pillarTile: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.lg,
    overflow: "hidden",
    marginBottom: 0,
    paddingRight: 8,
  },
  pillarAccent: { width: 4, alignSelf: "stretch", backgroundColor: colors.teal },
  pillarAccentPurple: { backgroundColor: colors.purple },
  pillarBody: { flex: 1, paddingVertical: 14, paddingHorizontal: 14 },
  pillarTitle: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.navy, letterSpacing: -0.2 },
  pillarCta: { marginTop: 4, fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.brand },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
  },
  countryPickerIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: "rgba(14, 205, 209, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(14, 205, 209, 0.35)",
  },
  countryPickerText: { flex: 1, minWidth: 0 },
  countryPickerTitle: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.navy },
  countryPickerSub: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 18 },
  inlineBtn: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  inlineBtnText: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.brand },
  modalSafe: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: 17, fontFamily: fontFamily.bold, color: colors.navy },
  modalDone: { fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.brand },
  modalList: { padding: 16, paddingBottom: 32, gap: 10 },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
  },
  modalRowEyebrow: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.teal, marginBottom: 4 },
  modalRowTitle: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.navy, letterSpacing: -0.15 },
});
