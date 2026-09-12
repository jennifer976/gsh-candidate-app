import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLanguage, useAppCopy } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { getMarketingSiteUrl } from "@/lib/config";
import { websiteLanguageMessage } from "@/lib/website-language";
import { useInAppWebStore } from "@/lib/in-app-web-store";
import { colors, fontFamily } from "@/lib/theme";

/** Web counterpart of the native WebView. Some providers require a separate browser tab. */
export function InAppWebHost() {
  const { t } = useAppCopy();
  const ac = useAccountCopy();
  const url = useInAppWebStore((s) => s.url);
  const close = useInAppWebStore((s) => s.close);
  const frame = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (url) setLoading(true); }, [url]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || typeof event.data !== "string") return;
      const locale = websiteLanguageMessage(event.data, event.origin, getMarketingSiteUrl());
      if (locale) useAppLanguage.getState().setLocale(locale);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  return (
    <Modal visible={Boolean(url)} animationType="none" onRequestClose={close}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.toolbar}>
          <Pressable onPress={close} style={styles.button} accessibilityRole="button">
            <Text style={styles.buttonText}>{t("jobDone")}</Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>{ac("Linked page")}</Text>
          {loading ? <ActivityIndicator size="small" color={colors.navy} /> : null}
          {url ? <a href={url} target="_blank" rel="noopener noreferrer" style={styles.browserLink}>{ac("Open in browser")}</a> : null}
        </View>
        {url ? <iframe ref={frame} key={url} src={url} title={ac("Linked page")}
          onLoad={() => setLoading(false)} onError={() => setLoading(false)}
          style={{ border: 0, width: "100%", flex: 1, minHeight: 0, background: colors.surfaceMuted }} /> : null}
      </SafeAreaView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  toolbar: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  button: { minHeight: 44, justifyContent: "center", paddingHorizontal: 8 },
  buttonText: { color: colors.navy, fontFamily: fontFamily.semiBold, fontSize: 15 },
  title: { flex: 1, color: colors.navy, fontFamily: fontFamily.semiBold, fontSize: 15 },
  browserLink: { color: colors.navy, fontFamily: fontFamily.semiBold, fontSize: 13, padding: 10, textDecorationLine: "underline" },
});
