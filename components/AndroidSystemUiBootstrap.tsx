import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { colors } from "@/lib/theme";

/**
 * SDK 54 / Android 15+ edge-to-edge: translucent status bar and themed nav bar.
 * Safe areas remain the responsibility of each screen (safe-area-context).
 */
export function AndroidSystemUiBootstrap() {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void NavigationBar.setBackgroundColorAsync(colors.navyDeep);
    void NavigationBar.setButtonStyleAsync("light");
    void NavigationBar.setPositionAsync("absolute");
  }, []);

  return <StatusBar style="light" translucent backgroundColor="transparent" />;
}
