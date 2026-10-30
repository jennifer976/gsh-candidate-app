import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppLanguageSetting } from "@/components/AppLanguageSetting";
import { Icon } from "@/components/Icon";
import { GshScreenShell } from "@/components/GshScreenShell";
import {
  BreakoutPhoto,
  Card,
  Row,
  RowCard,
  SectionHeader,
} from "@/components/v3";
import {
  DepthButton,
  GshMark,
  TitleWithStop,
} from "@/components/gsh-brand";
import { tabBarBottomPadding } from "@/lib/android-insets";
import { useSignInPrompt } from "@/lib/useSignInPrompt";
import { RiseIn } from "@/lib/motion";
import { colors, fontFamily, shadows } from "@/lib/theme";

/** Profile tab for signed-out visitors: sign in or register, plus language. */
export function GuestProfileHub() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { openSignIn, openRegister } = useSignInPrompt();

  return (
    <GshScreenShell constrainTabletWidth style={{ backgroundColor: colors.panel }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top + 26,
          paddingBottom: tabBarBottomPadding(insets.bottom),
        }}
        showsVerticalScrollIndicator={false}
      >
        <RiseIn>
          <TitleWithStop eyebrow="Your account" text="Profile" />
        </RiseIn>

        <RiseIn delay={60}>
          <View style={[styles.navyCard, { marginTop: 18 }]}>
            <GshMark
              size={300}
              color="rgba(255,255,255,0.05)"
              style={styles.mark}
            />
            <BreakoutPhoto
              photo="plan-hero"
              rotate={3}
              style={styles.breakout}
            />
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <Icon name="user" size={28} color={colors.navy} />
              </View>
            </View>
            <Text style={styles.title}>
              Create your profile
              <Text style={{ color: colors.cyan }}>.</Text>
            </Text>
            <Text style={styles.body}>
              Create a free account to save jobs, apply and hear from employers.
            </Text>
            <DepthButton
              title="Create a free account"
              onPress={() => openRegister("/(tabs)/profile")}
              variant="cyanOnNavy"
              size="md"
              style={{ marginTop: 20 }}
            />
            <Pressable
              onPress={() => openSignIn("/(tabs)/profile")}
              style={styles.glassBtn}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              <Text style={styles.glassText}>Sign in</Text>
            </Pressable>
            <View style={styles.trustRow}>
              <Icon name="lock" size={14} color={colors.cyan} />
              <Text style={styles.trustText}>
                Free for candidates. Private by default.
              </Text>
            </View>
          </View>
        </RiseIn>

        <RiseIn delay={120}>
          <View style={{ marginTop: 26 }}>
            <SectionHeader
              eyebrow="Before you sign in"
              title="Useful now"
            />
            <RowCard style={{ marginTop: 12 }}>
              <Row
                icon="gift"
                label="Relocation perks"
                hint="Offers that help with the move"
                onPress={() => router.push("/relocation-perks")}
              />
              <Row
                icon="sparkles"
                label="Career toolkit"
                hint="CV check, country guides, calculators"
                onPress={() => router.push("/tools-resources")}
                isLast
              />
            </RowCard>
          </View>
        </RiseIn>

        <RiseIn delay={160}>
          <View style={{ marginTop: 26 }}>
            <SectionHeader eyebrow="App settings" title="Language" />
            <Card padding={18} style={{ marginTop: 12 }}>
              <AppLanguageSetting />
            </Card>
          </View>
        </RiseIn>
      </ScrollView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  navyCard: {
    backgroundColor: colors.navy,
    borderRadius: 28,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 20,
    overflow: "visible",
    ...shadows.photo,
  },
  mark: { position: "absolute", right: -110, top: -110 },
  breakout: {
    position: "absolute",
    right: 16,
    top: -30,
    width: 104,
    height: 128,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: colors.navy,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 18,
    maxWidth: 220,
    fontFamily: fontFamily.headingStrong,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.8,
    color: colors.white,
  },
  body: {
    marginTop: 8,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.75)",
  },
  glassBtn: {
    marginTop: 10,
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  glassText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.white,
  },
  trustRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  trustText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: "rgba(255,255,255,0.72)",
  },
});
