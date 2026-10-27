import { useCallback, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { stopSpeaking } from "../../services/speech";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import EditIcon from "../../../assets/icons/edit.svg";
import HearIcon from "../../../assets/icons/hear.svg";
import PreLoader from "../PreLoader/pre-loader";
import { showWordStyles } from "./show-word.styles";
import ScreenHeaderCustomer from "../ScreenHeaderCustomer/ScreenHeaderCustomer";

export default function ShowWord() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const language = Array.isArray(params.language)
    ? params.language[0]
    : params.language;
  const {
    getConcept,
    languages,
    nativeLanguage,
    userLanguages,
    speakWord,
    speakActive,
    activeSpeechId,
  } = useVocabulary();
  const [concept, setConcept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useFocusEffect(
    useCallback(() => {
      void attempt;
      let active = true;
      setLoading(true);
      setConcept(null);
      setError("");
      async function loadWord() {
        try {
          if (!id || !language) throw new Error("Missing word parameters");
          const result = await getConcept(id, language);
          if (!result?.translations?.[0])
            throw new Error("Missing translation");
          if (active) setConcept(result);
        } catch {
          if (active) setError("Das Wort konnte nicht geladen werden.");
        } finally {
          if (active) setLoading(false);
        }
      }
      void loadWord();
      return () => {
        active = false;
        void stopSpeaking();
      };
    }, [id, language, attempt, getConcept]),
  );

  const source = concept?.translations?.[0];
  const target = concept?.translations?.[1];

  function getLanguageCode(translation) {
    const languageDetails = [
      nativeLanguage,
      ...languages,
      ...userLanguages,
    ].find((entry) => String(entry?.id) === String(translation.language));
    return (
      translation.language_code ||
      languageDetails?.language_code ||
      languageDetails?.code
    );
  }

  return (
    <SafeAreaView
      style={showWordStyles.screen}
      edges={["top", "right", "left"]}
    >
      <ScrollView contentContainerStyle={showWordStyles.content}>
        <ScreenHeaderCustomer
          title="Wort ansehen"
          style={showWordStyles.screenHeader}
          fallbackHref={{
            pathname: "/my-quiz/all-words",
            params: { language: language || "" },
          }}
        />
        <View style={showWordStyles.actions}>
          <Text style={showWordStyles.title} accessibilityRole="header">
            Wort ansehen
          </Text>
          <Pressable
            testID="edit-show-word"
            accessibilityRole="button"
            accessibilityLabel="Wort bearbeiten"
            disabled={loading || !target}
            style={[
              showWordStyles.action,
              (loading || !target) && showWordStyles.disabled,
            ]}
            onPress={() =>
              router.navigate({
                pathname: "/my-quiz/edit-word",
                params: {
                  id: String(concept.id || id),
                  language: String(target.language),
                  targetWord: String(target.id),
                },
              })
            }
          >
            <EditIcon width={22} height={22} />
          </Pressable>
        </View>
        {loading && <PreLoader />}
        {Boolean(error) && (
          <View style={showWordStyles.detail}>
            <Text style={showWordStyles.body} accessibilityRole="alert">
              {error}
            </Text>
            <Pressable
              testID="retry-show-word"
              accessibilityRole="button"
              onPress={() => setAttempt((value) => value + 1)}
              style={showWordStyles.retry}
            >
              <Text style={showWordStyles.label}>Erneut versuchen</Text>
            </Pressable>
          </View>
        )}
        <View style={showWordStyles.grid}>
          {source && (
            <View style={showWordStyles.card} testID="source-word-card">
              <View style={showWordStyles.header}>
                <View style={showWordStyles.languageRow}>
                  <Text style={[showWordStyles.language]}>
                    {" "}
                    {source.language_name}{" "}
                  </Text>
                  <Pressable
                    testID="speak-source-word"
                    accessibilityRole="button"
                    accessibilityLabel="Wort vorlesen"
                    accessibilityState={{
                      busy: speakActive && activeSpeechId === source.id,
                    }}
                    onPress={() =>
                      speakWord(source.word, getLanguageCode(source), source.id)
                    }
                    style={[
                      showWordStyles.action,
                      speakActive &&
                        activeSpeechId === source.id &&
                        showWordStyles.speaking,
                    ]}
                  >
                    <HearIcon width={24} height={24} />
                  </Pressable>
                </View>
                <Text style={[showWordStyles.word]} accessibilityRole="header">
                  {source.word}
                </Text>
              </View>
              <View style={showWordStyles.detail}>
                <Text style={[showWordStyles.label]}>Tipp</Text>
                <Text style={showWordStyles.body}>{source.tip || "---"}</Text>
              </View>
              <View style={[showWordStyles.detail, showWordStyles.sentence]}>
                <Text style={[showWordStyles.label]}>Beispielsatz</Text>
                <Text style={[showWordStyles.body, showWordStyles.italic]}>
                  {source.sentence || "---"}
                </Text>
              </View>
            </View>
          )}
          {target && (
            <View style={showWordStyles.card} testID="target-word-card">
              <View style={showWordStyles.header}>
                <View style={showWordStyles.languageRow}>
                  <Text
                    style={[showWordStyles.language, showWordStyles.greenBadge]}
                  >
                    {" "}
                    {target.language_name}{" "}
                  </Text>
                  <Pressable
                    testID="speak-target-word"
                    accessibilityRole="button"
                    accessibilityLabel="Wort vorlesen"
                    accessibilityState={{
                      busy: speakActive && activeSpeechId === target.id,
                    }}
                    onPress={() =>
                      speakWord(target.word, getLanguageCode(target), target.id)
                    }
                    style={[
                      showWordStyles.action,
                      speakActive &&
                        activeSpeechId === target.id &&
                        showWordStyles.speaking,
                    ]}
                  >
                    <HearIcon width={24} height={24} />
                  </Pressable>
                </View>
                <Text
                  style={[showWordStyles.word, showWordStyles.greenText]}
                  accessibilityRole="header"
                >
                  {target.word}
                </Text>
              </View>
              <View style={showWordStyles.detail}>
                <Text style={[showWordStyles.label, showWordStyles.greenText]}>
                  Tipp
                </Text>
                <Text style={showWordStyles.body}>{target.tip || "---"}</Text>
              </View>
              <View style={[showWordStyles.detail, showWordStyles.sentence]}>
                <Text style={[showWordStyles.label, showWordStyles.greenText]}>
                  Beispielsatz
                </Text>
                <Text style={[showWordStyles.body, showWordStyles.italic]}>
                  {target.sentence || "---"}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
