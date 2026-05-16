import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Redirect, Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/lib/auth-store";
import { colors, fontFamily } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

function TabGlyph({
  focused,
  color,
  filled,
  outline,
}: {
  focused: boolean;
  color: string;
  filled: IonName;
  outline: IonName;
}) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      {focused && (
        <View
          style={{
            position: "absolute",
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(14,205,209,0.12)",
          }}
        />
      )}
      <Ionicons name={focused ? filled : outline} size={23} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  const token = useAuthStore((s) => s.token);
  const insets = useSafeAreaInsets();

  if (!token) return <Redirect href="/login" />;

  const bottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 20 : 8);
  const tabBarPaddingTop = 8;
  const tabIconRowHeight = 48;

  const darkHeader = {
    headerStyle: { backgroundColor: colors.navyDeep },
    headerTintColor: colors.white,
    headerTitleStyle: {
      fontFamily: fontFamily.bold,
      fontSize: 17,
      color: colors.white,
    },
    headerShadowVisible: false,
  };

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: "rgba(255,255,255,0.4)",
        tabBarStyle: {
          backgroundColor: colors.navyDeep,
          borderTopColor: "rgba(255,255,255,0.08)",
          borderTopWidth: 1,
          paddingTop: tabBarPaddingTop,
          paddingBottom: bottomInset,
          height: tabIconRowHeight + tabBarPaddingTop + bottomInset,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.medium,
          fontSize: 10,
          marginTop: 2,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph focused={focused} color={color} filled="home" outline="home-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "Jobs",
          tabBarLabel: "Jobs",
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph focused={focused} color={color} filled="compass" outline="compass-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: "Applications",
          headerShown: true,
          ...darkHeader,
          tabBarLabel: "Applied",
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph focused={focused} color={color} filled="send" outline="send-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          headerShown: true,
          ...darkHeader,
          tabBarLabel: "Chats",
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph focused={focused} color={color} filled="chatbubbles" outline="chatbubbles-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph focused={focused} color={color} filled="person-circle" outline="person-circle-outline" />
          ),
        }}
      />
      <Tabs.Screen name="saved" options={{ href: null }} />
      <Tabs.Screen name="more" options={{ href: null }} />
    </Tabs>
  );
}
