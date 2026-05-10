import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { registerCandidatePushToken } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { navigateFromPushLink } from "@/lib/pushNavigate";

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
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const handledNotificationIds = useRef(new Set<string>());

  const handleNotificationOpen = useCallback(
    (response: Notifications.NotificationResponse | null) => {
      if (!response) return;
      const id = response.notification.request.identifier;
      if (handledNotificationIds.current.has(id)) return;
      handledNotificationIds.current.add(id);
      const data = response.notification.request.content.data as Record<string, unknown>;
      const link = typeof data.link === "string" ? data.link.trim() : "";
      if (!link) return;
      navigateFromPushLink(router, link);
    },
    [router]
  );

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationOpen(response);
    });
    return () => sub.remove();
  }, [handleNotificationOpen]);

  useEffect(() => {
    let cancelled = false;
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!cancelled) handleNotificationOpen(response);
    });
    return () => {
      cancelled = true;
    };
  }, [handleNotificationOpen]);

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
