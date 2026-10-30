import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { CompanyLogo } from "@/components/CompanyLogo";
import { CountryFlag } from "@/components/CountryFlag";
import { PlainTag, SupportChip } from "@/components/gsh-brand";
import { hapticConfirm } from "@/lib/haptics";
import { useHeartPop } from "@/lib/motion";
import { cardSurfaceStyle, colors, fontFamily, type } from "@/lib/theme";
import { canonicalCountryCode } from "@/lib/countries";

export type V3JobCardProps = {
  title: string;
  company: string;
  logoUrl?: string;
  countryIso2?: string | null;
  locationLabel: string;
  remote?: boolean;
  salaryLabel?: string | null;
  visaSponsorship?: boolean;
  relocationSupport?: boolean;
  remoteTag?: boolean;
  jobType?: string | null;
  postedLabel?: string | null;
  saved?: boolean;
  onPress: () => void;
  onToggleSave?: () => void;
  width?: number;
};

export function V3JobCard({
  title,
  company,
  logoUrl,
  countryIso2,
  locationLabel,
  remote,
  salaryLabel,
  visaSponsorship,
  relocationSupport,
  remoteTag,
  jobType,
  postedLabel,
  saved,
  onPress,
  onToggleSave,
  width,
}: V3JobCardProps) {
  const heart = useHeartPop();
  const iso = countryIso2
    ? canonicalCountryCode(countryIso2) || countryIso2
    : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title} at ${company}`}
      style={[styles.card, cardSurfaceStyle(), width != null ? { width } : null]}
    >
      <View style={styles.top}>
        <CompanyLogo logoUrl={logoUrl ?? ""} companyName={company} size={52} radius={14} />
        <View style={styles.topText}>
          <Text style={type.cardTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.company} numberOfLines={1}>
            {company}
          </Text>
        </View>
        {onToggleSave ? (
          <Pressable
            onPress={() => {
              heart.trigger();
              if (!saved) void hapticConfirm();
              onToggleSave();
            }}
            hitSlop={8}
            style={styles.heartHit}
            accessibilityRole="button"
            accessibilityLabel={saved ? "Remove from saved" : "Save job"}
          >
            <Animated.View style={heart.style}>
              <Ionicons
                name={saved ? "heart" : "heart-outline"}
                size={22}
                color={saved ? colors.navy : colors.muted}
              />
            </Animated.View>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        {iso ? <CountryFlag iso2={iso} size="small" /> : null}
        <Text style={styles.meta} numberOfLines={1}>
          {locationLabel}
          {remote ? " · Remote" : ""}
        </Text>
      </View>

      {salaryLabel ? (
        <Text style={styles.salary}>{salaryLabel}</Text>
      ) : (
        <Text style={styles.salaryMissing}>Salary not listed</Text>
      )}

      <View style={styles.chips}>
        <View style={styles.chipRow}>
          {visaSponsorship ? <SupportChip label="Visa sponsorship" /> : null}
          {relocationSupport ? <SupportChip label="Relocation support" /> : null}
          {remoteTag ? <PlainTag label="Remote" /> : null}
          {jobType ? <PlainTag label={jobType} /> : null}
        </View>
        {postedLabel ? <Text style={styles.posted}>{postedLabel}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    marginBottom: 12,
  },
  top: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  topText: { flex: 1, minWidth: 0 },
  company: {
    marginTop: 2,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.text2,
  },
  heartHit: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  meta: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.text2,
  },
  salary: {
    marginTop: 8,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.navy,
  },
  salaryMissing: {
    marginTop: 8,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.muted,
  },
  chips: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  chipRow: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  posted: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.muted,
  },
});
