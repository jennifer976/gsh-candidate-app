import { useAppCopy } from "@/lib/i18n";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, useRouter } from "expo-router";
import {
  Badge,
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  isCandidateOnboardingComplete,
} from "@/lib/candidate-onboarding";
import { useAuthStore } from "@/lib/auth-store";
import {
  fetchConversations,
  fetchSavedJobs,
  fetchUnreadNotificationCount,
} from "@/lib/api-client";
import { resumeCandidateReturnIntent } from "@/lib/candidate-return-intent";
import { EASE, useReduceMotion } from "@/lib/motion";
import { signupRoute } from "@/lib/onboardingFlow";
import { colors, fontFamily, shadows } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

const VISIBLE_TABS = ["home", "jobs", "saved", "messages", "profile"] as const;

function badgeText(n: number): string {
  return n > 99 ? "99+" : String(n);
}

function NativeTabIcon({
  sfDefault,
  sfSelected,
  outline,
  filled,
}: {
  sfDefault: string;
  sfSelected: string;
  outline: IonName;
  filled: IonName;
}) {
  return (
    <Icon
      sf={
        {
          default: sfDefault,
          selected: sfSelected,
        } as never
      }
      androidSrc={{
        default: <VectorIcon family={Ionicons} name={outline} />,
        selected: <VectorIcon family={Ionicons} name={filled} />,
      }}
    />
  );
}

function useTabBadges(token: string | null) {
  const savedBadge = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: fetchSavedJobs,
    enabled: Boolean(token),
    staleTime: 30_000,
  });
  const conversationsBadge = useQuery({
    queryKey: ["message-conversations"],
    queryFn: fetchConversations,
    enabled: Boolean(token),
    staleTime: 30_000,
  });
  const notificationsBadge = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: fetchUnreadNotificationCount,
    enabled: Boolean(token),
    staleTime: 30_000,
  });
  const unreadMessages = (conversationsBadge.data ?? []).reduce(
    (total, row) =>
      total + Math.max(0, row.unreadCount ?? (row.read === false ? 1 : 0)),
    0,
  );
  return {
    savedCount: savedBadge.data?.length ?? 0,
    unreadMessages,
    notifCount: notificationsBadge.data?.unreadCount ?? 0,
  };
}

function useOnboardingGate(token: string | null) {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingReady, setOnboardingReady] = useState(false);
  const resumingIntent = useRef(false);
  const redirected = useRef(false);

  useEffect(() => {
    if (!token) {
      setOnboardingReady(false);
      setShowOnboarding(false);
      redirected.current = false;
      return;
    }
    let cancelled = false;
    void isCandidateOnboardingComplete().then((done) => {
      if (cancelled) return;
      setShowOnboarding(!done);
      setOnboardingReady(true);
      if (!done && !redirected.current) {
        redirected.current = true;
        const route = signupRoute(2);
        router.replace(route as never);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router, token]);

  // Onboarding finishes outside this tree; poll while incomplete so return-intent can run.
  useEffect(() => {
    if (!token || !showOnboarding) return;
    const id = setInterval(() => {
      void isCandidateOnboardingComplete().then((done) => {
        if (done) setShowOnboarding(false);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [showOnboarding, token]);

  useEffect(() => {
    if (!token || !onboardingReady || showOnboarding || resumingIntent.current)
      return;
    resumingIntent.current = true;
    void resumeCandidateReturnIntent(router)
      .then((result) => {
        if (result.error)
          Alert.alert(
            "Action not completed",
            `${result.error} You can retry from this screen.`,
          );
      })
      .finally(() => {
        resumingIntent.current = false;
      });
  }, [onboardingReady, router, showOnboarding, token]);

  return { showOnboarding, onboardingReady };
}

const TAB_ICONS: Record<
  (typeof VISIBLE_TABS)[number],
  { outline: IonName; filled: IonName }
> = {
  home: { outline: "home-outline", filled: "home" },
  jobs: { outline: "briefcase-outline", filled: "briefcase" },
  saved: { outline: "bookmark-outline", filled: "bookmark" },
  messages: { outline: "chatbubbles-outline", filled: "chatbubbles" },
  profile: { outline: "person-outline", filled: "person" },
};

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const routes = state.routes.filter((route) =>
    (VISIBLE_TABS as readonly string[]).includes(route.name),
  );
  const activeIndex = Math.max(
    0,
    routes.findIndex((route) => route.key === state.routes[state.index]?.key),
  );

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(243,245,249,0)", "#f3f5f9"]}
        style={floatStyles.fade}
      />
      <View
        style={[
          floatStyles.bar,
          shadows.lift,
          { bottom: Math.max(insets.bottom, 10) + 8 },
        ]}
      >
        {routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : typeof options.title === "string"
                ? options.title
                : route.name;
          const focused = index === activeIndex;
          const icons = TAB_ICONS[route.name as (typeof VISIBLE_TABS)[number]];
          const badge = options.tabBarBadge;
          const badgeNum =
            typeof badge === "number"
              ? badge
              : typeof badge === "string"
                ? Number(badge.replace("+", "")) || badge
                : null;
          const a11yExtra =
            badgeNum != null && Number(badgeNum) > 0
              ? `, ${badge} unread`
              : badge != null && String(badge).length > 0
                ? `, ${badge} saved`
                : "";

          return (
            <FloatingTabItem
              key={route.key}
              focused={focused}
              label={label}
              outline={icons.outline}
              filled={icons.filled}
              badge={badge}
              reduceMotion={reduceMotion}
              accessibilityLabel={`${label}, tab, ${index + 1} of ${routes.length}${a11yExtra}`}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function FloatingTabItem({
  focused,
  label,
  outline,
  filled,
  badge,
  reduceMotion,
  accessibilityLabel,
  onPress,
}: {
  focused: boolean;
  label: string;
  outline: IonName;
  filled: IonName;
  badge?: string | number;
  reduceMotion: boolean;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const opacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    opacity.value = reduceMotion
      ? focused
        ? 1
        : 0
      : withTiming(focused ? 1 : 0, { duration: 260, easing: EASE });
  }, [focused, opacity, reduceMotion]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const showBadge = badge != null && String(badge).length > 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel}
      style={[floatStyles.tab, focused && floatStyles.tabActive]}
    >
      <View style={floatStyles.tabInner}>
        <Animated.View
          pointerEvents="none"
          style={[floatStyles.pill, pillStyle]}
        />
        <View style={floatStyles.iconWrap}>
          <Ionicons
            name={focused ? filled : outline}
            size={22}
            color={focused ? colors.white : colors.muted}
          />
          {showBadge ? (
            <View
              style={[
                floatStyles.badge,
                focused ? floatStyles.badgeOnActive : floatStyles.badgeIdle,
              ]}
            >
              <Text
                style={[
                  floatStyles.badgeText,
                  focused ? floatStyles.badgeTextOnActive : floatStyles.badgeTextIdle,
                ]}
              >
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          numberOfLines={1}
          style={[
            floatStyles.label,
            { color: focused ? colors.white : colors.muted },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const floatStyles = StyleSheet.create({
  fade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
  },
  bar: {
    position: "absolute",
    left: 12,
    right: 12,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    padding: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    flex: 1.25,
  },
  tabInner: {
    height: 58,
    width: "100%",
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  pill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.navy,
    borderRadius: 29,
  },
  iconWrap: {
    width: 28,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: 2,
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    lineHeight: 14,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  badgeIdle: {
    backgroundColor: colors.navy,
    borderColor: colors.white,
  },
  badgeOnActive: {
    backgroundColor: colors.cyan,
    borderColor: colors.navy,
  },
  badgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    lineHeight: 12,
  },
  badgeTextIdle: { color: colors.white },
  badgeTextOnActive: { color: colors.navy },
});

/**
 * Android release builds often show blank NativeTabs icons (VectorIcon not bundled).
 * Use JS Tabs on Android so icons/labels always render; keep NativeTabs on iOS.
 */
function AndroidTabs() {
  const { t } = useAppCopy();
  const token = useAuthStore((s) => s.token);
  const { savedCount, unreadMessages } = useTabBadges(token);
  useOnboardingGate(token);

  return (
    <Tabs
      safeAreaInsets={{ top: 0, right: 0, bottom: 0, left: 0 }}
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("home"),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: t("jobs"),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: t("saved"),
          tabBarBadge: savedCount > 0 ? badgeText(savedCount) : undefined,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t("messages"),
          tabBarBadge:
            unreadMessages > 0 ? badgeText(unreadMessages) : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profile"),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="applications" options={{ href: null }} />
      <Tabs.Screen name="more" options={{ href: null }} />
    </Tabs>
  );
}

function IosNativeTabs() {
  const { t } = useAppCopy();
  const token = useAuthStore((s) => s.token);
  const { savedCount, unreadMessages, notifCount } = useTabBadges(token);
  useOnboardingGate(token);

  return (
    <NativeTabs
      tintColor="#0d194e"
      iconColor={{
        default: colors.muted,
        selected: "#0d194e",
      }}
      labelStyle={{
        default: { fontSize: 10, fontWeight: "600", color: colors.muted },
        selected: { fontSize: 10, fontWeight: "700", color: "#0d194e" },
      }}
      backgroundColor={colors.white}
      badgeBackgroundColor="#0d194e"
      shadowColor="rgba(13,25,78,0.12)"
      disableTransparentOnScrollEdge
      minimizeBehavior="onScrollDown"
      blurEffect="systemChromeMaterialLight"
    >
      <NativeTabs.Trigger name="home">
        <Label>{t("home")}</Label>
        <NativeTabIcon
          sfDefault="house"
          sfSelected="house.fill"
          outline="home-outline"
          filled="home"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="jobs">
        <Label>{t("jobs")}</Label>
        <NativeTabIcon
          sfDefault="briefcase"
          sfSelected="briefcase.fill"
          outline="briefcase-outline"
          filled="briefcase"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="saved">
        <Label>{t("saved")}</Label>
        <NativeTabIcon
          sfDefault="bookmark"
          sfSelected="bookmark.fill"
          outline="bookmark-outline"
          filled="bookmark"
        />
        {savedCount > 0 ? <Badge>{badgeText(savedCount)}</Badge> : null}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="messages">
        <Label>{t("messages")}</Label>
        <NativeTabIcon
          sfDefault="bubble.left.and.bubble.right"
          sfSelected="bubble.left.and.bubble.right.fill"
          outline="chatbubbles-outline"
          filled="chatbubbles"
        />
        {unreadMessages > 0 ? (
          <Badge>{badgeText(unreadMessages)}</Badge>
        ) : null}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>{t("profile")}</Label>
        <NativeTabIcon
          sfDefault="person.crop.circle"
          sfSelected="person.crop.circle.fill"
          outline="person-circle-outline"
          filled="person-circle"
        />
        {notifCount > 0 ? <Badge>{badgeText(notifCount)}</Badge> : null}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default function TabsLayout() {
  return Platform.OS === "ios" ? <IosNativeTabs /> : <AndroidTabs />;
}
