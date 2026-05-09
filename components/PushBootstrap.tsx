import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";
import { registerCandidatePushToken } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registers for push permissions and obtains an Expo push token when signed in.
 * Delivering pushes still requires your backend to accept/store tokens and send via Expo push API.
 */
export function PushBootstrap() {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;

    void (async () => {
      try {
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }
        const perm = await Notifications.getPermissionsAsync();
        let status = perm.status;
        if (status !== "granted") {
          const req = await Notifications.requestPermissionsAsync();
          status = req.status;
        }
        if (status !== "granted") return;

        const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
        const projectId =
          extra?.eas?.projectId ??
          (Constants.easConfig as { projectId?: string } | undefined)?.projectId;

        const expoPush = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        );

        const plat: "ios" | "android" | "web" =
          Platform.OS === "android" ? "android" : Platform.OS === "web" ? "web" : "ios";

        await registerCandidatePushToken(expoPush.data, plat);

        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.info("[push] Registered Expo token with API");
        }
      } catch (e) {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn("[push] registration skipped:", e);
        }
      }
    })();
  }, [token]);

  return null;
}
