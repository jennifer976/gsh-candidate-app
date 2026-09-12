import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { atsAnalyze, atsParseProfile } from "@/lib/api-client";
import { useAppCopy } from "@/lib/i18n";
import type { AppLanguage } from "@/lib/i18n/catalog";
import reviewCopy from "@/data/candidateCvReviewCopy.json";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

type Analysis = {
  score: number; keywordMatch: number; formatScore: number; marketFit: number; recruiterFit: number;
  matched: string[]; missing: string[]; risks: string[]; actions: string[];
  gapAnalysis: {term: string; type: string; suggestion: string}[];
  sectionFeedback: {section: string; issue: string; improvedPhrase: string}[];
};
export default function AtsAssistantScreen() {
  const { t, locale } = useAppCopy();
  const copy = reviewCopy[locale];
  const [cvText, setCvText] = useState("");
  const [profileJson, setProfileJson] = useState<Record<string, unknown> | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [country, setCountry] = useState("");
  const [role, setRole] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const current = useRef({cvText, jobDescription, country, role, locale});
  current.current = {cvText, jobDescription, country, role, locale};
  useEffect(() => { setAnalysis(null); }, [locale, cvText, jobDescription, country, role]);

  const parseMut = useMutation({
    mutationFn: (text: string) => atsParseProfile(text),
    onSuccess: (data, text) => {
      if (current.current.cvText.trim() !== text) return;
      setProfileJson(data.profile);
    },
    onError: () => Alert.alert(t("errorLoad"), copy.atsErrorGeneric),
  });
  const analyzeMut = useMutation({
    mutationFn: (input: {profile: Record<string, unknown>; jobDescription: string; country: string; role: string; locale: AppLanguage; cvText: string}) => {
      const { cvText: originalCv, ...request } = input;
      return atsAnalyze(request);
    },
    onSuccess: (data, input) => {
      const latest = current.current;
      if (latest.locale !== input.locale || latest.cvText !== input.cvText || latest.jobDescription.trim() !== input.jobDescription || latest.country.trim() !== input.country || latest.role.trim() !== input.role) return;
      setAnalysis(data.analysis as Analysis);
    },
    onError: () => Alert.alert(t("errorLoad"), copy.atsErrorGeneric),
  });
  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{flex:1}}>
          <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <GshScreenIntro eyebrow={copy.atsBadge.toLocaleLowerCase(locale)} title={copy.atsHeading} subtitle={copy.atsLead} style={{marginBottom:12}} />
            <View style={styles.accentBar} />
            <Text style={styles.resultBody}>{copy.atsDisclaimer}</Text>
            <GshSectionTitle title={copy.atsCvPasteLabel} />
            <TextInput accessibilityLabel={copy.atsCvPasteLabel} style={[styles.input,styles.area]} multiline value={cvText}
              onChangeText={text => {setCvText(text);setProfileJson(null);setAnalysis(null);}}
              placeholder={copy.atsCvPlaceholder} placeholderTextColor={colors.placeholder} textAlignVertical="top" />
            <GshGradientPrimaryButton title={copy.atsExtractProfile} onPress={() => parseMut.mutate(cvText.trim())}
              loading={parseMut.isPending} disabled={!cvText.trim() || parseMut.isPending} containerStyle={{marginTop:10}} />
            {profileJson ? <Text style={styles.resultBody}>{copy.atsProfileReady}</Text> : null}
            <GshSectionTitle title={copy.atsJobDescription} />
            <TextInput accessibilityLabel={copy.atsJobDescription} style={[styles.input,styles.area]} multiline value={jobDescription} onChangeText={setJobDescription}
              placeholder={copy.atsJobDescriptionPlaceholder} placeholderTextColor={colors.placeholder} textAlignVertical="top" />
            <Text style={styles.label}>{copy.atsTargetCountry}</Text>
            <TextInput accessibilityLabel={copy.atsTargetCountry} style={styles.input} value={country} onChangeText={setCountry} placeholder={copy.atsTargetCountryPlaceholder} placeholderTextColor={colors.placeholder} />
            <Text style={styles.label}>{copy.atsTargetRole}</Text>
            <TextInput accessibilityLabel={copy.atsTargetRole} style={styles.input} value={role} onChangeText={setRole} placeholder={copy.atsTargetRolePlaceholder} placeholderTextColor={colors.placeholder} />
            <GshGradientPrimaryButton title={copy.atsAnalyze} onPress={() => {
              if (!profileJson) return;
              analyzeMut.mutate({profile:profileJson,jobDescription:jobDescription.trim(),country:country.trim(),role:role.trim(),locale,cvText});
            }} loading={analyzeMut.isPending} disabled={!profileJson || !jobDescription.trim() || analyzeMut.isPending || parseMut.isPending} containerStyle={{marginTop:10}} />
            {analysis ? <View style={[cardSurfaceStyle(false),styles.result]}>
              <GshSectionTitle title={copy.atsOverallMatch} topSpacing="none" />
              <Text style={styles.resultBody}>{analysis.score.toLocaleString(locale)}/100</Text>
              <Text style={styles.resultBody}>{copy.atsScoresHint}</Text>
              {([['keywordMatch','atsMetricKeywords'],['formatScore','atsMetricFormat'],['marketFit','atsMetricMarket'],['recruiterFit','atsMetricRecruiter']] as const).map(([key,label]) =>
                <Text key={key} style={styles.resultBody}>{copy[label]}: {analysis[key].toLocaleString(locale)}/100</Text>)}
              {([['matched','atsMatched'],['missing','atsMissing'],['risks','atsRisks'],['actions','atsActions']] as const).map(([key,label]) => analysis[key].length ?
                <View key={key}><GshSectionTitle title={copy[label]} />{analysis[key].map((text,index) => <Text key={index} style={styles.resultBody}>• {text}</Text>)}</View> : null)}
              {analysis.gapAnalysis.length ? <View><GshSectionTitle title={copy.atsGapAnalysis} />{analysis.gapAnalysis.map((row,index) =>
                <View key={index}><Text style={styles.label}>{row.term}</Text><Text style={styles.resultBody}>{row.type}</Text><Text style={styles.resultBody}>{row.suggestion}</Text></View>)}</View> : null}
              {analysis.sectionFeedback.length ? <View><GshSectionTitle title={copy.atsSectionFeedback} />{analysis.sectionFeedback.map((row,index) =>
                <View key={index}><Text style={styles.label}>{row.section}</Text><Text style={styles.resultBody}>{row.issue}</Text><Text style={styles.resultBody}>{copy.atsSuggestedPhrase}: {row.improvedPhrase}</Text></View>)}</View> : null}
            </View> : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: stackScrollContentStyle,
  accentBar: { height: 3, backgroundColor: colors.teal, marginBottom: 14 },
  label: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: 14,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  area: { minHeight: 120 },
  result: {
    marginTop: 22,
    padding: 16,
    backgroundColor: colors.background,
    borderLeftWidth: 4,
    borderLeftColor: colors.brand,
    borderRadius: radii.md,
  },
  resultBody: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMarketing, lineHeight: 22 },
});
