/**
 * Haptics: only three moments get a light confirm tap. Saving a job, sending an application in the app, and finishing sign-up. Nothing on taps, tabs, scrolls, toggles, chips, swipes or errors.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const isNative = Platform.OS === "ios" || Platform.OS === "android";

type HapticsPreference = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

/** On by default. The setting is stored on the device. */
export const useHapticsPreference = create<HapticsPreference>()(
  persist(
    (set) => ({
      enabled: true,
      setEnabled: (enabled) => set({ enabled }),
    }),
    {
      name: "gsh-haptics",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ enabled: state.enabled }),
    },
  ),
);

function hapticsAllowed() {
  return isNative && useHapticsPreference.getState().enabled;
}

let lastConfirmAt = 0;

/** Light confirm — save job, send application, finish sign-up. */
export async function hapticConfirm() {
  if (!hapticsAllowed()) return;
  const now = Date.now();
  if (now - lastConfirmAt < 1000) return;
  lastConfirmAt = now;
  try {
    if (Platform.OS === "android") {
      try {
        await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm);
      } catch {
        await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Context_Click);
      }
    } else if (Platform.OS === "ios") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    /* ignore */
  }
}

/** No-op — kept so old imports compile. Prefer hapticConfirm for the three allowed moments. */
export async function hapticLight() {
  return Promise.resolve();
}

/** No-op — kept so old imports compile. */
export async function hapticSelection() {
  return Promise.resolve();
}

/** No-op — kept so old imports compile. */
export async function hapticMedium() {
  return Promise.resolve();
}

/** No-op — kept so old imports compile. */
export async function hapticSuccess() {
  return Promise.resolve();
}

/** No-op — kept so old imports compile. */
export async function hapticWarning() {
  return Promise.resolve();
}

/** No-op — kept so old imports compile. */
export async function hapticError() {
  return Promise.resolve();
}
