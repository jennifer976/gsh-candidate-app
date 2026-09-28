import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

const KEY = "gsh-last-cv-check-v1";

export type LastCvCheck = { score: number; checkedAt: string };

export async function saveLastCvCheck(score: number): Promise<void> {
  const value: LastCvCheck = { score: Math.round(score), checkedAt: new Date().toISOString() };
  await AsyncStorage.setItem(KEY, JSON.stringify(value));
}

export async function loadLastCvCheck(): Promise<LastCvCheck | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LastCvCheck>;
    if (typeof parsed.score !== "number" || typeof parsed.checkedAt !== "string") return null;
    return { score: parsed.score, checkedAt: parsed.checkedAt };
  } catch {
    return null;
  }
}

/** The score from the most recent CV quality check on this device, refreshed whenever the screen gains focus. */
export function useLastCvCheck(): LastCvCheck | null {
  const [last, setLast] = useState<LastCvCheck | null>(null);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      void loadLastCvCheck().then((value) => {
        if (active) setLast(value);
      });
      return () => {
        active = false;
      };
    }, []),
  );
  return last;
}
