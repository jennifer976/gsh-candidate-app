import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "gsh.candidate.onboarding.v1";

export async function isCandidateOnboardingComplete(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEY)) === "1";
  } catch {
    return false;
  }
}

export async function markCandidateOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, "1");
}

/** Dev / QA only — call from a hidden settings action if needed later. */
export async function resetCandidateOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
