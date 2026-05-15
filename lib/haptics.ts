import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const isNative = Platform.OS === "ios" || Platform.OS === "android";

/** Light tap — for bookmarking, toggling, selecting */
export async function hapticLight() {
  if (!isNative) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

/** Medium — for segment switches, filter changes */
export async function hapticMedium() {
  if (!isNative) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {}
}

/** Success — for saving, applying, completing */
export async function hapticSuccess() {
  if (!isNative) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
}

/** Warning — for errors, validation fails */
export async function hapticWarning() {
  if (!isNative) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {}
}

/** Error — for destructive actions like withdraw */
export async function hapticError() {
  if (!isNative) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {}
}
