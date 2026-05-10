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
import { marketingUrl } from "@/lib/marketing-links";
import { colors, fontFamily } from "@/lib/theme";

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

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      {error ? (
        <View style={styles.errWrap}>
          <Ionicons name="cloud-offline-outline" size={44} color={colors.textMuted} />
          <Text style={styles.errTitle}>Could not load page</Text>
          <Text style={styles.errSub}>{error}</Text>
          <Pressable style={styles.retry} onPress={onRetry} accessibilityRole="button">
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
          <Pressable style={styles.linkBtn} onPress={() => void Linking.openURL(uri)} accessibilityRole="button">
            <Text style={styles.linkBtnText}>Open in Safari / Chrome</Text>
          </Pressable>
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
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.brand} />
            </View>
          ) : null}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  web: { flex: 1 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 16, marginRight: 8 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  errWrap: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center", gap: 12 },
  errTitle: { fontFamily: fontFamily.bold, fontSize: 17, color: colors.textPrimary },
  errSub: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
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
