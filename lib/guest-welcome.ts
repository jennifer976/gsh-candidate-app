import AsyncStorage from "@react-native-async-storage/async-storage";

const SKIP_KEY = "gsh.candidate.welcome.skipped.v1";

/** Guest chose "Skip to app" — browse tabs without an account. */
export async function hasSkippedWelcome(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(SKIP_KEY)) === "1";
  } catch {
    return false;
  }
}

export async function markWelcomeSkipped(): Promise<void> {
  await AsyncStorage.setItem(SKIP_KEY, "1");
}

export async function clearWelcomeSkipped(): Promise<void> {
  await AsyncStorage.removeItem(SKIP_KEY);
}
