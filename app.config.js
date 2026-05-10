/**
 * Merges build-time env into `extra` so EAS / `.env` can supply Supabase (same as the website blog).
 * Values mirror NEXT_PUBLIC_SUPABASE_* on global_sponsor_hub-fe.
 */
const appJson = require("./app.json");

module.exports = () => ({
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra || {}),
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || "",
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || "",
    },
  },
});
