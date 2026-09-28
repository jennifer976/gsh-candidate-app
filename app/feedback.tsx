import { withSignIn } from "@/components/SignInGate";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { submitFeedback } from "@/lib/api-client";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { colors, fontFamily, radii } from "@/lib/theme";

const TYPES = ["feature", "issue", "update", "request"] as const;
const PRIOS = ["low", "medium", "high"] as const;

function FeedbackScreen() {
  const ac = useAccountCopy();

  const router = useRouter();
  const [title, setTitle] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("feature");
  const [priority, setPriority] = useState<(typeof PRIOS)[number]>("medium");

  const mut = useMutation({
    mutationFn: () =>
      submitFeedback({
        title: title.trim(),
        description: description.trim(),
        type,
        priority,
      }),
    onSuccess: () => {
      Alert.alert(ac("Thank you"), ac("Your feedback was submitted."), [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (e: unknown) =>
      Alert.alert(
        ac("Could not send"),
        ac("Please try again."),
      ),
  });

  function send() {
    setFormError(null);
    if (!title.trim() || !description.trim()) {
      setFormError("Please add a title and description.");
      return;
    }
    mut.mutate();
  }

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.pad}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <GshScreenIntro
              eyebrow="Global Sponsor Hub"
              title={ac("Feedback")}
              subtitle={ac(
                "Tell us about a problem or an idea to improve the app.",
              )}
              style={{ marginBottom: 16 }}
            />

            <View style={styles.accentBar} />

            <Text style={styles.label}>{ac("Type")}</Text>
            <View style={styles.row}>
              {TYPES.map((t) => (
                <Pressable
                  key={t}
                  style={[styles.chip, type === t && styles.chipOn]}
                  onPress={() => setType(t)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: type === t }}
                >
                  <Text
                    style={[styles.chipText, type === t && styles.chipTextOn]}
                  >
                    {ac(
                      (
                        {
                          feature: "Feature idea",
                          issue: "Problem",
                          update: "Update",
                          request: "Request",
                        } as const
                      )[t],
                    )}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>{ac("Priority")}</Text>
            <View style={styles.row}>
              {PRIOS.map((p) => (
                <Pressable
                  key={p}
                  style={[styles.chip, priority === p && styles.chipOn]}
                  onPress={() => setPriority(p)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: priority === p }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      priority === p && styles.chipTextOn,
                    ]}
                  >
                    {ac(
                      ({ low: "Low", medium: "Medium", high: "High" } as const)[
                        p
                      ],
                    )}
                  </Text>
                </Pressable>
              ))}
            </View>

            <GshSectionTitle title={ac("Details")} topSpacing="md" />
            <Text style={styles.label}>{ac("Title")}</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder={ac("Short summary")}
              placeholderTextColor={colors.placeholder}
            />

            <Text style={styles.label}>{ac("Description")}</Text>
            <TextInput
              style={[styles.input, styles.area]}
              value={description}
              onChangeText={setDescription}
              placeholder={ac("What happened? What did you expect?")}
              placeholderTextColor={colors.placeholder}
              multiline
              textAlignVertical="top"
            />

            {formError ? <Text accessibilityRole="alert" style={{color: colors.error, marginVertical: 12}}>{ac(formError)}</Text> : null}
            <GshGradientPrimaryButton
              title={mut.isPending ? ac("Sending…") : ac("Send feedback")}
              onPress={send}
              disabled={mut.isPending}
              containerStyle={{ marginTop: 20 }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, paddingBottom: 40 },
  accentBar: { height: 3, backgroundColor: colors.teal, marginBottom: 16 },
  label: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: {
    backgroundColor: colors.chipOnBg,
    borderColor: colors.chipOnBorder,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
    textTransform: "capitalize",
  },
  chipTextOn: { color: colors.white },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  area: { minHeight: 140, marginBottom: 4 },
});

export default withSignIn(FeedbackScreen, {
  icon: "chatbox-ellipses-outline",
  title: "Send feedback",
  body: "Sign in to send feedback to the Global Sponsor Hub team.",
});
