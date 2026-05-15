import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { listCountryVisaGuideSummaries } from "@/lib/guides/countryVisaGuides";
import { RELOCATION_RESOURCES_NAV_LINKS, SEO_PILLAR_NAV_LINKS } from "@/lib/guides/seoGuideNav";
import { colors, fontFamily, radii } from "@/lib/theme";

const COUNTRY_EMOJIS: Record<string, string> = {
  "United Kingdom": "🇬🇧",
  "Canada": "🇨🇦",
  "Australia": "🇦🇺",
  "United States": "🇺🇸",
  "Germany": "🇩🇪",
  "Ireland": "🇮🇪",
  "Netherlands": "🇳🇱",
  "New Zealand": "🇳🇿",
  "Singapore": "🇸🇬",
  "UAE": "🇦🇪",
  "Dubai": "🇦🇪",
};

type GuideAccent = "purple" | "teal" | "amber";

const TOPIC_META: { keyword: string; icon: string; accent: GuideAccent; readMin: number }[] = [
  { keyword: "visa", icon: "id-card-outline", accent: "purple", readMin: 8 },
  { keyword: "sponsor", icon: "star-outline", accent: "purple", readMin: 6 },
  { keyword: "reloc", icon: "airplane-outline", accent: "teal", readMin: 5 },
  { keyword: "work", icon: "briefcase-outline", accent: "teal", readMin: 7 },
  { keyword: "hous", icon: "home-outline", accent: "teal", readMin: 4 },
  { keyword: "health", icon: "medkit-outline", accent: "amber", readMin: 5 },
  { keyword: "financ", icon: "card-outline", accent: "amber", readMin: 4 },
  { keyword: "school", icon: "school-outline", accent: "amber", readMin: 6 },
];

const ACCENT_STYLES: Record<GuideAccent, { bg: string; icon: string }> = {
  purple: { bg: "#f5f3ff", icon: colors.brand },
  teal: { bg: "rgba(14,205,209,0.1)", icon: "#0f766e" },
  amber: { bg: "#fffbeb", icon: "#92400e" },
};

function getTopicMeta(label: string): { icon: string; accent: GuideAccent; readMin: number } {
  const lower = label.toLowerCase();
  for (const m of TOPIC_META) {
    if (lower.includes(m.keyword)) return m;
  }
  return { icon: "document-text-outline", accent: "purple", readMin: 5 };
}

function GuideCard({
  title,
  subtitle,
  icon,
  accent,
  readMin,
  badge,
  onPress,
}: {
  title: string;
  subtitle?: string;
  icon: string;
  accent: GuideAccent;
  readMin?: number;
  badge?: string;
  onPress: () => void;
}) {
  const pal = ACCENT_STYLES[accent];
  return (
    <Pressable style={styles.guideCard} onPress={onPress} accessibilityRole="button">
      <View style={[styles.guideIconWrap, { backgroundColor: pal.bg }]}>
        <Ionicons name={icon as any} size={22} color={pal.icon} />
      </View>
      <View style={styles.guideCardBody}>
        <Text style={styles.guideCardTitle} numberOfLines={2}>{title}</Text>
        {subtitle ? (
          <Text style={styles.guideCardSub} numberOfLines={2}>{subtitle}</Text>
        ) : null}
        <View style={styles.guideCardMeta}>
          {readMin ? (
            <View style={styles.readTimeRow}>
              <Ionicons name="time-outline" size={12} color={colors.textMuted} />
              <Text style={styles.readTimeText}>{readMin} min</Text>
            </View>
          ) : null}
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.borderStrong} />
    </Pressable>
  );
}

type ActiveFilter = "all" | "visa" | "relocation" | "country";

export default function GuidesHubScreen() {
  const router = useRouter();
  const countries = listCountryVisaGuideSummaries();
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  const filterPills: { id: ActiveFilter; label: string }[] = [
    { id: "all", label: "All guides" },
    { id: "visa", label: "Visa & sponsorship" },
    { id: "relocation", label: "Relocation" },
    { id: "country", label: "By country" },
  ];

  return (
    <View style={styles.shell}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Hero ── */}
        <LinearGradient colors={[colors.navy, colors.navyDeep]} style={styles.hero}>
          <SafeAreaView edges={["top"]} style={styles.heroInner}>
            <Text style={styles.heroEyebrow}>Knowledge hub</Text>
            <Text style={styles.heroTitle}>Guides & resources</Text>
            <Text style={styles.heroSub}>
              Visa routes, country hubs, relocation checklists — everything in one place.
            </Text>

            {/* Visa wizard CTA */}
            <Pressable
              style={styles.wizardCta}
              onPress={() => router.push("/visa-wizard")}
              accessibilityRole="button"
            >
              <View style={styles.wizardCtaLeft}>
                <View style={styles.wizardCtaIcon}>
                  <Ionicons name="sparkles" size={20} color={colors.teal} />
                </View>
                <View>
                  <Text style={styles.wizardCtaTitle}>Visa wizard</Text>
                  <Text style={styles.wizardCtaSub}>Find your sponsorship route</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward-circle" size={26} color={colors.teal} />
            </Pressable>
          </SafeAreaView>
        </LinearGradient>

        {/* ── Filter pills ── */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {filterPills.map((p) => (
              <Pressable
                key={p.id}
                style={[styles.filterPill, activeFilter === p.id && styles.filterPillOn]}
                onPress={() => setActiveFilter(p.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: activeFilter === p.id }}
              >
                <Text style={[styles.filterPillText, activeFilter === p.id && styles.filterPillTextOn]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.content}>

          {/* ── Country hubs ── */}
          {(activeFilter === "all" || activeFilter === "country") && (
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionRule} />
                  <Text style={styles.sectionTitle}>Country hubs</Text>
                </View>
                <Pressable
                  onPress={() => setCountryPickerOpen(true)}
                  accessibilityRole="button"
                >
                  <Text style={styles.sectionAction}>See all</Text>
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.countryScroll}>
                {countries.slice(0, 8).map((c) => {
                  const emoji = c.flagEmoji || COUNTRY_EMOJIS[c.countryLabel] || "🌍";
                  return (
                    <Pressable
                      key={c.slug}
                      style={styles.countryCard}
                      onPress={() => router.push(`/guides/country/${c.slug}`)}
                      accessibilityRole="button"
                    >
                      <Text style={styles.countryFlag}>{emoji}</Text>
                      <Text style={styles.countryName} numberOfLines={1}>{c.countryLabel}</Text>
                      <Text style={styles.countryCount}>Open guide</Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  style={[styles.countryCard, styles.countryCardMore]}
                  onPress={() => setCountryPickerOpen(true)}
                  accessibilityRole="button"
                >
                  <Ionicons name="earth-outline" size={28} color={colors.brand} />
                  <Text style={styles.countryMoreLabel}>All countries</Text>
                </Pressable>
              </ScrollView>
            </View>
          )}

          {/* ── Visa & sponsorship topics ── */}
          {(activeFilter === "all" || activeFilter === "visa") && (
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionRule} />
                  <Text style={styles.sectionTitle}>Visa & sponsorship</Text>
                </View>
              </View>
              {SEO_PILLAR_NAV_LINKS.map((g, i) => {
                const meta = getTopicMeta(g.label);
                return (
                  <GuideCard
                    key={g.href}
                    title={g.label}
                    icon={meta.icon}
                    accent={meta.accent}
                    readMin={meta.readMin}
                    badge={i === 0 ? "Popular" : undefined}
                    onPress={() =>
                      router.push({ pathname: "/guides/topic", params: { q: encodeURIComponent(g.href) } })
                    }
                  />
                );
              })}
            </View>
          )}

          {/* ── Relocation ── */}
          {(activeFilter === "all" || activeFilter === "relocation") && (
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionRule, { backgroundColor: colors.teal }]} />
                  <Text style={styles.sectionTitle}>Relocating safely</Text>
                </View>
              </View>
              {RELOCATION_RESOURCES_NAV_LINKS.map((g) => {
                const meta = getTopicMeta(g.label);
                return (
                  <GuideCard
                    key={g.href}
                    title={g.label}
                    icon={meta.icon}
                    accent="teal"
                    readMin={meta.readMin}
                    onPress={() =>
                      router.push({ pathname: "/guides/topic", params: { q: encodeURIComponent(g.href) } })
                    }
                  />
                );
              })}
            </View>
          )}

          {/* ── Also useful ── */}
          {activeFilter === "all" && (
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionRule, { backgroundColor: colors.textMuted }]} />
                  <Text style={styles.sectionTitle}>Also useful</Text>
                </View>
              </View>
              {[
                {
                  label: "Partner directory",
                  sub: "Relocation, legal & immigration services",
                  icon: "people-outline",
                  href: "/partners",
                  accent: "purple" as GuideAccent,
                },
                {
                  label: "Tools & resources",
                  sub: "Blog, FAQs, legal docs, career kit",
                  icon: "layers-outline",
                  href: "/tools-resources",
                  accent: "teal" as GuideAccent,
                },
              ].map((item) => (
                <GuideCard
                  key={item.href}
                  title={item.label}
                  subtitle={item.sub}
                  icon={item.icon}
                  accent={item.accent}
                  onPress={() => router.push(item.href as any)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Country picker modal ── */}
      <Modal
        visible={countryPickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCountryPickerOpen(false)}
      >
        <SafeAreaView style={styles.modalSafe} edges={["top"]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose a country</Text>
            <Pressable onPress={() => setCountryPickerOpen(false)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={colors.navy} />
            </Pressable>
          </View>
          <FlatList
            data={countries}
            keyExtractor={(c) => c.slug}
            contentContainerStyle={{ paddingBottom: 32 }}
            renderItem={({ item: c }) => {
              const emoji = c.flagEmoji || COUNTRY_EMOJIS[c.countryLabel] || "🌍";
              return (
                <Pressable
                  style={styles.countryRow}
                  onPress={() => {
                    setCountryPickerOpen(false);
                    router.push(`/guides/country/${c.slug}`);
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.countryRowEmoji}>{emoji}</Text>
                  <Text style={styles.countryRowLabel}>{c.countryLabel}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#f0f2f6" },
  scrollContent: { paddingBottom: 48 },

  // Hero
  hero: { paddingBottom: 28 },
  heroInner: { paddingHorizontal: 20, paddingTop: 8 },
  heroEyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: colors.teal,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: fontFamily.extraBold,
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 21,
    marginBottom: 20,
  },
  wizardCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(14,205,209,0.3)",
  },
  wizardCtaLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  wizardCtaIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(14,205,209,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  wizardCtaTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.white,
  },
  wizardCtaSub: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },

  // Filter pills
  filterRow: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
  },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterPillOn: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  filterPillText: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
  },
  filterPillTextOn: { color: colors.white },

  // Content
  content: { padding: 16, gap: 28 },

  // Sections
  section: { gap: 10 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionRule: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: colors.brand,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.3,
  },
  sectionAction: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
  },

  // Country cards
  countryScroll: { gap: 10, paddingBottom: 4 },
  countryCard: {
    width: 110,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(14,23,42,0.07)",
    alignItems: "flex-start",
    gap: 4,
  },
  countryCardMore: { alignItems: "center", justifyContent: "center", gap: 8 },
  countryFlag: { fontSize: 28 },
  countryName: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
  },
  countryCount: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  countryMoreLabel: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
    textAlign: "center",
  },

  // Guide cards
  guideCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(14,23,42,0.07)",
  },
  guideIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  guideCardBody: { flex: 1, minWidth: 0 },
  guideCardTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.15,
    marginBottom: 3,
  },
  guideCardSub: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 17,
    marginBottom: 6,
  },
  guideCardMeta: { flexDirection: "row", alignItems: "center", gap: 10 },
  readTimeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  readTimeText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.secondaryTintBg,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
  },

  // Modal
  modalSafe: { flex: 1, backgroundColor: colors.white },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: 18, fontFamily: fontFamily.bold, color: colors.navy },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 12,
  },
  countryRowEmoji: { fontSize: 22 },
  countryRowLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
  },
});
