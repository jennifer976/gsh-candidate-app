import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { CompanyLogo } from "@/components/CompanyLogo";
import { CountryFlag } from "@/components/CountryFlag";
import { Icon } from "@/components/Icon";
import { PlainTag, SupportChip } from "@/components/gsh-brand";
import { RiseIn, useHeartPop } from "@/lib/motion";
import { colors, fontFamily, shadows } from "@/lib/theme";

export type JobCardProps = {
  title: string;
  company: string;
  logoUrl?: string;
  countryIso2?: string | null;
  countryLabel: string;
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
  /** Full list card (default) or compact Home rail. */
  variant?: "full" | "rail";
  /** Entrance stagger index for card-in (45ms, capped at 8). */
  index?: number;
};

export function cardInDelay(index: number): number {
  return Math.min(Math.max(index, 0), 7) * 45;
}

export function JobCard({
  title,
  company,
  logoUrl,
  countryIso2,
  countryLabel,
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
  variant = "full",
  index = 0,
}: JobCardProps) {
  const heart = useHeartPop();
  const rail = variant === "rail";
  const logoSize = rail ? 48 : 52;
  const salary = salaryLabel?.trim() || "";

  const heartButton =
    onToggleSave ? (
      <Pressable
        onPress={() => {
          heart.trigger();
          onToggleSave();
        }}
        hitSlop={4}
        style={styles.heartHit}
        accessibilityRole="button"
        accessibilityLabel={saved ? "Remove from saved" : "Save job"}
      >
        <Animated.View style={heart.style}>
          <Icon
            name="heart"
            size={20}
            color={colors.navy}
            strokeWidth={1.8}
            fill={saved ? colors.navy : "none"}
          />
        </Animated.View>
      </Pressable>
    ) : null;

  const body = (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title} at ${company}`}
      style={[styles.card, rail ? styles.rail : null]}
    >
      <View style={styles.top}>
        <View
          style={[
            styles.logoWell,
            { width: logoSize, height: logoSize, borderRadius: 14 },
          ]}
        >
          <CompanyLogo
            logoUrl={logoUrl ?? ""}
            companyName={company}
            size={Math.round(logoSize * 0.82)}
            radius={10}
          />
        </View>
        <View style={styles.topText}>
          <Text
            style={[styles.title, rail && styles.titleRail]}
            numberOfLines={rail ? 1 : 2}
          >
            {title}
          </Text>
          <Text
            style={[styles.company, rail && styles.companyRail]}
            numberOfLines={1}
          >
            {company}
          </Text>
        </View>
        {!rail ? heartButton : null}
      </View>

      {rail && heartButton ? (
        <View style={styles.railHeartAbs} pointerEvents="box-none">
          {heartButton}
        </View>
      ) : null}

      <View style={styles.metaRow}>
        {countryIso2 || !countryLabel ? (
          <CountryFlag iso2={countryIso2} size="sm" />
        ) : (
          <CountryFlag iso2={null} size="sm" />
        )}
        <Text style={styles.meta} numberOfLines={1}>
          {countryLabel}
          {remote ? " · Remote" : ""}
          {rail && jobType ? ` · ${jobType}` : ""}
        </Text>
      </View>

      {salary ? (
        <Text style={[styles.salary, rail && styles.salaryRail]}>{salary}</Text>
      ) : (
        <Text style={[styles.salaryMissing, rail && styles.salaryRail]}>
          Salary not listed
        </Text>
      )}

      {!rail ? (
        <View style={styles.chips}>
          <View style={styles.chipRow}>
            {visaSponsorship ? <SupportChip label="Visa sponsorship" /> : null}
            {relocationSupport ? (
              <SupportChip label="Relocation support" />
            ) : null}
            {remoteTag ? <PlainTag label="Remote" /> : null}
            {jobType ? <PlainTag label={jobType} /> : null}
          </View>
          {postedLabel ? <Text style={styles.posted}>{postedLabel}</Text> : null}
        </View>
      ) : null}
    </Pressable>
  );

  return <RiseIn delay={cardInDelay(index)}>{body}</RiseIn>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    ...shadows.card,
    overflow: "hidden",
  },
  rail: {
    width: 272,
    marginBottom: 0,
    position: "relative",
  },
  top: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  logoWell: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  topText: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.2,
    color: colors.navy,
  },
  titleRail: {
    paddingRight: 48,
  },
  company: {
    marginTop: 2,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text2,
  },
  companyRail: {
    paddingRight: 48,
  },
  heartHit: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  railHeartAbs: {
    position: "absolute",
    top: 18,
    right: 18,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  meta: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text2,
  },
  salary: {
    marginTop: 6,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.navy,
  },
  salaryRail: {
    fontSize: 14,
    lineHeight: 20,
  },
  salaryMissing: {
    marginTop: 6,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.muted,
  },
  chips: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  chipRow: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  posted: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
});
