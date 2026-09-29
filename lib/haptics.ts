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

/** Light tap — for bookmarking, toggling, selecting */
export async function hapticLight() {
  if (!hapticsAllowed()) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

/** Medium — for segment switches, filter changes */
export async function hapticMedium() {
  if (!hapticsAllowed()) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {}
}

/** Success — for saving, applying, completing */
export async function hapticSuccess() {
  if (!hapticsAllowed()) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
}

/** Warning — for errors, validation fails */
export async function hapticWarning() {
  if (!hapticsAllowed()) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {}
}

/** Error — for destructive actions like withdraw */
export async function hapticError() {
  if (!hapticsAllowed()) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {}
}
