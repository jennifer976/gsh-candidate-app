import { StatusBar } from "expo-status-bar";
import { useSegments } from "expo-router";
import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { colors } from "@/lib/theme";

/** Top-level routes whose top edge is white or cyan; every other screen sits under the navy header. */
const LIGHT_TOP_ROUTES = new Set(["(tabs)", "verify", "tools", "ui-preview"]);

async function applyAndroidChrome() {
  if (Platform.OS !== "android") return;
  try {
    // Prefer inline (relative) nav so tabs/scroll aren't covered. No-ops if edge-to-edge locks it.
    await NavigationBar.setPositionAsync("relative");
  } catch {
    /* edge-to-edge / unsupported */
  }
  try {
    await NavigationBar.setBackgroundColorAsync(colors.white);
    await NavigationBar.setButtonStyleAsync("dark");
  } catch {
    /* ignore */
  }
}

/**
 * Keep system chrome from covering Native Tabs / scroll content.
 * Re-apply on resume — some OEMs reset overlay mode after splash.
 */
export function AndroidSystemUiBootstrap() {
  const segments = useSegments();
  const top = segments[0];
  const lightTop = top === undefined || LIGHT_TOP_ROUTES.has(top);

  useEffect(() => {
    void applyAndroidChrome();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void applyAndroidChrome();
    });
    return () => sub.remove();
  }, []);

  return <StatusBar style={lightTop ? "dark" : "light"} hidden={false} />;
}
