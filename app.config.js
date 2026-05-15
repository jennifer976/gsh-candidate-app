/**
 * Single Expo config (no static app.json — required for `expo doctor`).
 * Build-time env fills `extra` for Supabase (same idea as NEXT_PUBLIC_SUPABASE_* on the website).
 */
module.exports = () => ({
  expo: {
    name: "Global Sponsor Hub",
    slug: "gsh-candidate-app",
    scheme: "gsh-candidate",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/brand-icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/brand-logo-white.png",
      resizeMode: "contain",
      backgroundColor: "#040c24",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.globalsponsorhub.candidate",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: ["remote-notification"],
      },
    },
    android: {
      package: "com.globalsponsorhub.candidate",
      adaptiveIcon: {
        foregroundImage: "./assets/brand-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: "./assets/brand-icon.png",
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-av",
      [
        "expo-notifications",
        {
          icon: "./assets/brand-icon.png",
          color: "#610a90",
          defaultChannel: "default",
        },
      ],
      "expo-font",
      "expo-web-browser",
    ],
    extra: {
      apiUrl: "https://api.globalsponsorhub.com",
      siteUrl: "https://www.globalsponsorhub.com",
      privacyPolicyUrl: "https://www.globalsponsorhub.com/privacy-policy",
      router: {},
      eas: {
        projectId: "7de27b37-fe11-4dd5-8f6a-413693433a1f",
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || "",
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || "",
    },
    owner: "jennielouxx",
  },
});
