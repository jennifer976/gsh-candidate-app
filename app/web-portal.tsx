import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { marketingUrl } from "@/lib/marketing-links";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function WebPortalScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ path?: string; title?: string }>();
  const rawPath = useMemo(() => {
    const p = typeof params.path === "string" ? params.path : "%2F";
    try {
      const decoded = decodeURIComponent(p);
      return decoded.startsWith("/") ? decoded : `/${decoded}`;
    } catch {
      return p.startsWith("/") ? p : `/${p}`;
    }
  }, [params.path]);
  const title = typeof params.title === "string" ? params.title : "Browse";
  const uri = useMemo(() => marketingUrl(rawPath), [rawPath]);

  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerRight: () => (
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => webRef.current?.reload()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Reload page"
          >
            <Ionicons name="refresh" size={22} color={colors.brand} />
          </Pressable>
          <Pressable
            onPress={() => void WebBrowser.openBrowserAsync(uri)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Open in browser"
          >
            <Ionicons name="open-outline" size={22} color={colors.brand} />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, title, uri]);

  const onRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    webRef.current?.reload();
  }, []);

  const pathPreview =
    rawPath.length > 56 ? `${rawPath.slice(0, 54)}…` : rawPath;

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {error ? (
          <View style={styles.errWrap}>
            <View style={[cardSurfaceStyle(false), styles.errCard]}>
              <View style={styles.errCardAccent} />
              <View style={styles.errCardFront}>
                <Ionicons name="cloud-offline-outline" size={44} color={colors.textMuted} />
                <Text style={styles.errEyebrow}>Global Sponsor Hub</Text>
                <Text style={styles.errTitle}>Could not load page</Text>
                <Text style={styles.errSub}>{error}</Text>
                <Pressable style={styles.retry} onPress={onRetry} accessibilityRole="button">
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
                <Pressable style={styles.linkBtn} onPress={() => void Linking.openURL(uri)} accessibilityRole="button">
                  <Text style={styles.linkBtnText}>Open in Safari / Chrome</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <>
            <WebView
              ref={webRef}
              source={{ uri }}
              style={styles.web}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError("Check your connection or try opening in the system browser.");
              }}
              onHttpError={(e) => {
                const status = e.nativeEvent.statusCode;
                if (status >= 400) {
                  setLoading(false);
                  setError(`Server returned ${status}.`);
                }
              }}
              /** Third-party ATS pages inside links still open in-webview; “Apply” on curated roles uses system browser from job screen. */
              setSupportMultipleWindows={Platform.OS === "android"}
              originWhitelist={["https://", "http://"]}
            />
            {loading ? (
              <View style={styles.loadingOverlay} accessibilityLabel="Loading web content">
                <View style={[cardSurfaceStyle(false), styles.splashCard]}>
                  <View style={styles.splashAccent} />
                  <View style={styles.splashFront}>
                    <Text style={styles.splashEyebrow}>Global Sponsor Hub</Text>
                    <Text style={styles.splashTitle}>{title}</Text>
                    <Text style={styles.splashPath} numberOfLines={2}>
                      {pathPreview}
                    </Text>
                    <Text style={styles.splashHint}>Loading trusted hub content in this viewer…</Text>
                    <ActivityIndicator size="large" color={colors.brand} style={styles.splashSpinner} />
                  </View>
                </View>
              </View>
            ) : null}
          </>
        )}
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  web: { flex: 1, backgroundColor: colors.background },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 16, marginRight: 8 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    backgroundColor: "rgba(248, 250, 252, 0.94)",
  },
  splashCard: {
    width: "100%",
    maxWidth: 340,
    paddingVertical: 26,
    paddingHorizontal: 22,
    overflow: "hidden",
    borderLeftWidth: 4,
    borderLeftColor: colors.teal,
    backgroundColor: colors.background,
  },
  splashAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    borderBottomLeftRadius: radii.xl,
    backgroundColor: colors.purpleMuted,
    opacity: 0.85,
  },
  splashEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  splashTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    letterSpacing: -0.35,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  splashPath: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.textMarketing,
    lineHeight: 20,
    marginBottom: 8,
  },
  splashHint: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  splashSpinner: { marginTop: 22 },
  splashFront: { zIndex: 1, width: "100%" },
  errWrap: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
  errCard: {
    width: "100%",
    maxWidth: 360,
    paddingVertical: 28,
    paddingHorizontal: 22,
    overflow: "hidden",
    borderLeftWidth: 4,
    borderLeftColor: colors.warningBorder,
    backgroundColor: colors.background,
  },
  errCardFront: { zIndex: 1, width: "100%", alignItems: "center", gap: 10 },
  errCardAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 100,
    height: 100,
    borderBottomLeftRadius: radii.lg,
    backgroundColor: colors.warningBg,
    opacity: 0.9,
  },
  errEyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
  },
  errTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 19,
    color: colors.textPrimary,
    textAlign: "center",
  },
  errSub: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 6,
  },
  retry: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: colors.brand,
  },
  retryText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.white },
  linkBtn: { marginTop: 12, padding: 12 },
  linkBtnText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.brand },
});
