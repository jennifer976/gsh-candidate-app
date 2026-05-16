import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LegalDocView } from "@/components/LegalDocView";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { LEGAL_DOCUMENTS, type LegalDocId } from "@/lib/legal/appLegalDocs";
import { colors, fontFamily } from "@/lib/theme";

function isLegalDocId(s: string): s is LegalDocId {
  return s in LEGAL_DOCUMENTS;
}

export default function LegalDocumentScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const key = String(slug || "");
  const doc = isLegalDocId(key) ? LEGAL_DOCUMENTS[key] : null;

  useLayoutEffect(() => {
    if (doc) navigation.setOptions({ title: doc.title });
  }, [doc, navigation]);

  if (!doc) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.center} edges={["bottom"]}>
          <GshScreenIntro
            underStackHeader
            title="Document not found"
            subtitle="That legal document is not in this app build."
            style={{ marginBottom: 12, paddingHorizontal: 8 }}
          />
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.link}>Go back</Text>
          </Pressable>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  return (
    <GshScreenBackground>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <LegalDocView doc={doc} />
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 16 },
  link: { fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.brand },
});
