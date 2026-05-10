import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { BrandedSplash } from "@/components/BrandedSplash";
import { useAuthStore } from "@/lib/auth-store";

const SPLASH_MS = 1100;

export default function Index() {
  const token = useAuthStore((s) => s.token);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (token) return;
    const t = setTimeout(() => setSplashDone(true), SPLASH_MS);
    return () => clearTimeout(t);
  }, [token]);

  if (token) return <Redirect href="/(tabs)" />;
  if (!splashDone) return <BrandedSplash />;
  return <Redirect href="/login" />;
}
