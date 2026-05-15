import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { useInAppWebStore } from "@/lib/in-app-web-store";
import { colors, fontFamily } from "@/lib/theme";

/**
 * Full-screen sheet with an embedded browser so candidates are not sent to the system browser for third-party pages.
 */
export function InAppWebHost() {
  const url = useInAppWebStore((s) => s.url);
  const close = useInAppWebStore((s) => s.close);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (url) setLoading(true);
  }, [url]);

  return (
    <Modal
      visible={!!url}
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      onRequestClose={close}
    >
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.toolbar}>
          <Pressable onPress={close} style={styles.doneWrap} accessibilityRole="button" accessibilityLabel="Close">
            <Text style={styles.done}>Done</Text>
          </Pressable>
          <Text style={styles.toolbarTitle} numberOfLines={1}>
            Linked page
          </Text>
          <View style={styles.trailing}>
            {loading ? <ActivityIndicator size="small" color={colors.brand} /> : null}
          </View>
        </View>
        {url ? (
          <WebView
            source={{ uri: url }}
            style={styles.web}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => setLoading(false)}
            setSupportMultipleWindows={false}
            originWhitelist={["http://", "https://"]}
            {...(Platform.OS === "android" ? { mixedContentMode: "compatibility" as const } : {})}
          />
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 8,
  },
  doneWrap: { minWidth: 64, paddingVertical: 6, paddingHorizontal: 4 },
  done: { fontSize: 17, fontFamily: fontFamily.semiBold, color: colors.brand },
  toolbarTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
  },
  trailing: { minWidth: 36, minHeight: 28, alignItems: "center", justifyContent: "center" },
  web: { flex: 1, backgroundColor: colors.surfaceMuted },
});
