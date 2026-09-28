/**
 * Single Expo config (no static app.json — required for `expo doctor`).
 * Build-time env fills `extra` for Supabase (same idea as NEXT_PUBLIC_SUPABASE_* on the website).
 */
module.exports = () => {
  const isStaging = process.env.GSH_APP_VARIANT?.trim() === "staging";
  const productionIntentFilters = [
    {
      action: "VIEW",
      autoVerify: true,
      data: [
        { scheme: "https", host: "www.globalsponsorhub.com", pathPrefix: "/" },
        { scheme: "https", host: "globalsponsorhub.com", pathPrefix: "/" },
      ],
      category: ["BROWSABLE", "DEFAULT"],
    },
  ];

  return {
    expo: {
    name: isStaging ? "Global Sponsor Hub Staging" : "Global Sponsor Hub",
    slug: "gsh-candidate-app",
    scheme: isStaging ? "gsh-candidate-staging" : "gsh-candidate",
    version: "1.0.15",
    orientation: "portrait",
    icon: "./assets/brand-icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/brand-mark-navy.png",
      resizeMode: "contain",
      backgroundColor: "#42e0e3",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: isStaging
        ? "com.globalsponsorhub.candidate.staging"
        : "com.globalsponsorhub.candidate",
      associatedDomains: isStaging
        ? []
        : ["applinks:www.globalsponsorhub.com", "applinks:globalsponsorhub.com"],
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: ["remote-notification"],
      },
    },
    android: {
      package: isStaging ? "global.sponsor.hub.staging" : "global.sponsor.hub",
      intentFilters: isStaging ? [] : productionIntentFilters,
      adaptiveIcon: {
        foregroundImage: "./assets/brand-icon.png",
        backgroundColor: "#0d194e",
      },
      predictiveBackGestureEnabled: false,
      softwareKeyboardLayoutMode: "resize",
    },
    androidStatusBar: {
      backgroundColor: "#ffffff",
      barStyle: "dark-content",
      translucent: false,
    },
    androidNavigationBar: {
      backgroundColor: "#ffffff",
      barStyle: "dark-content",
      enforceContrast: false,
    },
    web: {
      favicon: "./assets/brand-icon.png",
    },
    plugins: [
      "expo-asset",
      "expo-router",
      "expo-secure-store",
      [
        "expo-notifications",
        {
          icon: "./assets/brand-icon.png",
          color: "#42e0e3",
          defaultChannel: "default",
        },
      ],
      "expo-font",
      [
        "expo-splash-screen",
        {
          image: "./assets/brand-mark-navy.png",
          // Android 12+ masks the splash icon to a 192dp circle; 176dp keeps the mark's corner shapes inside it.
          imageWidth: 176,
          resizeMode: "contain",
          backgroundColor: "#42e0e3",
        },
      ],
      "expo-web-browser",
    ],
    extra: {
      apiUrl:
        process.env.EXPO_PUBLIC_API_URL?.trim() ||
        "https://api.globalsponsorhub.com",
      siteUrl:
        process.env.EXPO_PUBLIC_SITE_URL?.trim() ||
        "https://www.globalsponsorhub.com",
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
  };
};
