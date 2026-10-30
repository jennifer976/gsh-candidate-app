import { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { CountryFlag } from "@/components/CountryFlag";
import { Icon } from "@/components/Icon";
import { displayRouteLine } from "@/lib/countryRouteLines";
import { EASE, useReduceMotion } from "@/lib/motion";
import { COUNTRY_PHOTO, SITE_PHOTOS } from "@/lib/sitePhotos";
import { colors, fontFamily, shadows } from "@/lib/theme";

const CARD_W = 168;
const CARD_H = 224;

export function CountryCard({
  slug,
  name,
  iso2,
  onPress,
}: {
  slug: string;
  name: string;
  iso2: string;
  onPress?: () => void;
}) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const photoKey = COUNTRY_PHOTO[slug];
  const source = photoKey ? SITE_PHOTOS[photoKey] : undefined;

  // Pack rule: route lines only when ROUTE_LINES_APPROVED (see displayRouteLine).
  const secondLine = displayRouteLine(slug);

  useEffect(() => {
    if (reduceMotion) scale.value = 1;
  }, [reduceMotion, scale]);

  const photoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        if (reduceMotion) return;
        scale.value = withTiming(1.04, { duration: 160, easing: EASE });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 160, easing: EASE });
      }}
      accessibilityRole="button"
      accessibilityLabel={`Jobs in ${name}`}
      style={styles.card}
    >
      {source ? (
        <Animated.View style={[StyleSheet.absoluteFill, photoStyle]}>
          <Image source={source} style={StyleSheet.absoluteFill} resizeMode="cover" />
        </Animated.View>
      ) : null}
      <LinearGradient
        colors={["rgba(13,25,78,0.05)", "rgba(13,25,78,0.9)"]}
        locations={[0.25, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.flag}>
        <CountryFlag iso2={iso2} size={28} />
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        <Text numberOfLines={2} style={styles.second}>
          {secondLine}
        </Text>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>See jobs</Text>
          <Icon name="arrow-right" size={14} color={colors.cyan} strokeWidth={2.2} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.navy,
    ...shadows.card,
  },
  flag: {
    position: "absolute",
    top: 14,
    right: 14,
  },
  copy: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    gap: 4,
  },
  name: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 17,
    lineHeight: 22,
    color: colors.white,
  },
  second: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255,255,255,0.72)",
  },
  cta: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ctaText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    lineHeight: 16,
    color: colors.cyan,
  },
});
