import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Redirect, Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/lib/auth-store";
import { colors, fontFamily, navHeader } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

function TabGlyph({ focused, color, filled, outline }: { focused: boolean; color: string; filled: IonName; outline: IonName }) {
  return <Ionicons name={focused ? filled : outline} size={24} color={color} />;
}

export default function TabsLayout() {
  const token = useAuthStore((s) => s.token);
  const insets = useSafeAreaInsets();

  if (!token) return <Redirect href="/login" />;

  const bottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 8 : 6);
  const tabBarPaddingTop = 6;
  const tabContentApprox = 52;

  return (
    <Tabs
      screenOptions={{
        ...navHeader,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: tabBarPaddingTop,
          paddingBottom: bottomInset,
          height: tabContentApprox + tabBarPaddingTop + bottomInset,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.medium,
          fontSize: 11,
          marginTop: 2,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Jobs",
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph focused={focused} color={color} filled="briefcase" outline="briefcase-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph focused={focused} color={color} filled="bookmark" outline="bookmark-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: "Applied",
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph focused={focused} color={color} filled="document-text" outline="document-text-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph focused={focused} color={color} filled="chatbubbles" outline="chatbubbles-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph focused={focused} color={color} filled="person" outline="person-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph
              focused={focused}
              color={color}
              filled="ellipsis-horizontal-circle"
              outline="ellipsis-horizontal-circle-outline"
            />
          ),
        }}
      />
    </Tabs>
  );
}
