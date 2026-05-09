import { Redirect, Tabs } from "expo-router";
import { Text } from "react-native";
import { useAuthStore } from "@/lib/auth-store";

export default function TabsLayout() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#f8fafc" },
        headerTintColor: "#0f172a",
        headerShadowVisible: false,
        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#e2e8f0" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Jobs",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }} accessibilityLabel="Jobs">
              💼
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }} accessibilityLabel="Saved jobs">
              🔖
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: "Applied",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }} accessibilityLabel="Applications">
              📋
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }} accessibilityLabel="Messages">
              💬
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }} accessibilityLabel="Profile">
              👤
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }} accessibilityLabel="More">
              ⋯
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}
