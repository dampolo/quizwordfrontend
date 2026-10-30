import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useQuiz from "@quizword/shared/quiz/useQuiz";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import { stopSpeaking } from "../../services/speech";
import { colors } from "../../styles/basic";
import HearIcon from "../../../assets/icons/hear.svg";
import CloseIcon from "../../../assets/icons/xbox.svg";
import PreLoader from "../PreLoader/pre-loader";
import QuizResults from "../QuizResults/quiz-results";
import { styles } from "../../styles/styles";
import { hearQuizStyles } from "./hear-quiz.styles";

function buttonStyle({ pressed }) {
  return [styles.button, pressed && styles.pressed];
}

export default function HearQuiz() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const language = Array.isArray(params.language)
    ? params.language[0]
    : params.language;
  const redirect =
    (Array.isArray(params.redirect) ? params.redirect[0] : params.redirect) ===
    "true";
  const { getQuizWords, postQuizAnswers } = useQuiz();
  const {
    speakWord,
    speakActive,
    activeSpeechId,
    languages,
    userLanguages,
    nativeLanguage,
  } = useVocabulary();
  const actions = useRef({ getQuizWords, postQuizAnswers });
  const session = useRef(0);
  const advancing = useRef(false);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [hint, setHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    actions.current = { getQuizWords, postQuizAnswers };
  }, [getQuizWords, postQuizAnswers]);

  useEffect(() => {
    advancing.current = false;
  }, [currentQuestion]);

  useFocusEffect(
    useCallback(() => {
      void attempt;
      const currentSession = ++session.current;
      advancing.current = false;
      setLoading(true);
      setQuiz(null);
      setLoadError("");
      setSubmitError("");
      setCurrentQuestion(0);
      setAnswer("");
      setAnswers([]);
      setHint(false);
      setSubmitting(false);
      setResult(null);

      async function loadQuiz() {
        try {
          if (!id) {
            throw new Error("Missing quiz id");
          }
          const data = await actions.current.getQuizWords(id);
          if (!Array.isArray(data?.concepts)) {
            throw new Error("Missing quiz words");
          }
          for (const concept of data.concepts) {
            if (
              concept.id == null ||
              !concept.translations?.[0]?.word ||
              !concept.translations?.[1]?.word
            ) {
              throw new Error("Incomplete quiz word");
            }
          }
          if (session.current === currentSession) {
            setQuiz(data);
          }
        } catch {
          if (session.current === currentSession) {
            const message =
              "Das Quiz konnte nicht geladen werden. Bitte versuche es erneut.";
            setLoadError(message);
            Alert.alert("Quiz konnte nicht geladen werden", message);
          }
        } finally {
          if (session.current === currentSession) {
            setLoading(false);
          }
        }
      }

      void loadQuiz();
      return () => {
        session.current += 1;
        void stopSpeaking().catch(() => {});
      };
    }, [id, attempt]),
  );

  const concepts = quiz?.concepts ?? [];
  const question = concepts[currentQuestion];
  const source = question?.translations?.[0];
  const target = question?.translations?.[1];
  const speechId = `hear-${id}-${currentQuestion}`;
  const speaking = speakActive && activeSpeechId === speechId;
  const totalQuestions = concepts.length;
  const questionNumber =
    question && !loading && !loadError ? currentQuestion + 1 : 0;
  const progress = totalQuestions ? (questionNumber / totalQuestions) * 100 : 0;
  const canContinue =
    !loading &&
    !submitting &&
    !result &&
    Boolean(question) &&
    answer.trim().length >= 2;

  function retry() {
    void stopSpeaking().catch(() => {});
    setAttempt((previous) => previous + 1);
  }

  function changeAnswer(value) {
    setAnswer(value);
    setSubmitError("");
  }

  function toggleHint() {
    setHint((previous) => !previous);
  }

  function cancel() {
    if (submitting) {
      return;
    }
    void stopSpeaking().catch(() => {});
    Keyboard.dismiss();
    if (!redirect && router.canGoBack()) {
      router.back();
      return;
    }
    router.dismissTo({
      pathname: "/my-quiz/(all-quizzes)/all-quizzes",
      params: { language: language || "" },
    });
  }

  async function nextQuestion() {
    if (!canContinue || advancing.current) {
      return;
    }
    void stopSpeaking().catch(() => {});
    advancing.current = true;
    setHint(false);
    const updatedAnswers = [
      ...answers,
      { id: question.id, answer: answer.trim() },
    ];
    if (currentQuestion < totalQuestions - 1) {
      setAnswers(updatedAnswers);
      setCurrentQuestion((previous) => previous + 1);
      setAnswer("");
      setSubmitError("");
      return;
    }
    const currentSession = session.current;
    setSubmitting(true);
    setSubmitError("");
    Keyboard.dismiss();
    try {
      const response = await actions.current.postQuizAnswers(id, {
        direction: "FORWARD",
        answers: updatedAnswers,
      });
      if (session.current === currentSession) {
        setResult(response || {});
      }
    } catch {
      if (session.current === currentSession) {
        const message =
          "Dein Test konnte nicht abgegeben werden. Deine Antworten bleiben erhalten. Bitte versuche es erneut.";
        setSubmitError(message);
        Alert.alert("Abgabe fehlgeschlagen", message);
      }
    } finally {
      if (session.current === currentSession) {
        setSubmitting(false);
        advancing.current = false;
      }
    }
  }

  function pronounce() {
    if (!target || submitting || result) {
      return;
    }
    const details = [
      nativeLanguage,
      ...(languages ?? []),
      ...(userLanguages ?? []),
    ].find((entry) => String(entry?.id) === String(target.language));
    const code =
      target.language_code || details?.language_code || details?.code;
    speakWord(target.word, code, speechId);
  }

  function soundStyle({ pressed }) {
    return [
      styles.closeButton,
      hearQuizStyles.soundButton,
      speaking && hearQuizStyles.speaking,
      pressed && styles.pressed,
      submitting && styles.buttonDisabled,
    ];
  }

  function continueStyle({ pressed }) {
    return [
      styles.button,
      pressed && canContinue && styles.pressed,
      !canContinue && styles.buttonDisabled,
    ];
  }

  function closeStyle({ pressed }) {
    return [
      styles.closeButton,
      pressed && styles.pressed,
      submitting && styles.buttonDisabled,
    ];
  }

  function helpStyle({ pressed }) {
    return [
      hearQuizStyles.helpButton,
      pressed && styles.pressed,
      submitting && styles.buttonDisabled,
    ];
  }

  return (
    <SafeAreaView
      style={hearQuizStyles.screen}
      edges={["top", "right", "bottom", "left"]}
    >
      {result ? (
        <QuizResults
          result={result}
          quizName={quiz?.quiz_name}
          onRepeat={retry}
          onClose={cancel}
        />
      ) : (
        <KeyboardAvoidingView
          style={hearQuizStyles.keyboard}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={hearQuizStyles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={hearQuizStyles.card}>
              <View
                style={hearQuizStyles.progress}
                pointerEvents="none"
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel="Quizfortschritt"
                accessibilityValue={{
                  min: 0,
                  max: totalQuestions || 1,
                  now: questionNumber,
                }}
              >
                <View
                  style={[
                    hearQuizStyles.progressFill,
                    { width: `${progress}%` },
                  ]}
                />
              </View>
              <Text style={hearQuizStyles.quizName} numberOfLines={1}>
                {quiz?.quiz_name || "Hörquiz"}
              </Text>
              <View style={hearQuizStyles.header}>
                <Text style={hearQuizStyles.languages}>
                  {source && target
                    ? `${source.language_name || ""} → ${target.language_name || ""}`
                    : "Hörquiz"}
                </Text>
                <Pressable
                  testID="close-hear-quiz"
                  accessibilityRole="button"
                  accessibilityLabel="Hörquiz beenden"
                  disabled={submitting}
                  accessibilityState={{ disabled: submitting }}
                  onPress={cancel}
                  style={closeStyle}
                >
                  <CloseIcon width={25} height={25} accessible={false} />
                </Pressable>
              </View>
              {loading ? (
                <PreLoader />
              ) : loadError ? (
                <View style={hearQuizStyles.form}>
                  <Text
                    style={hearQuizStyles.message}
                    accessibilityRole="alert"
                  >
                    {loadError}
                  </Text>
                  <Pressable
                    testID="retry-hear-quiz"
                    accessibilityRole="button"
                    onPress={retry}
                    style={buttonStyle}
                  >
                    <Text style={styles.buttonText}>Erneut versuchen</Text>
                  </Pressable>
                </View>
              ) : !question ? (
                <Text style={hearQuizStyles.message}>
                  Dieses Quiz enthält noch keine Wörter.
                </Text>
              ) : (
                <View style={hearQuizStyles.form}>
                  <Pressable
                    testID="speak-hear-quiz"
                    accessibilityRole="button"
                    accessibilityLabel="Wort vorlesen"
                    accessibilityState={{
                      disabled: submitting,
                      busy: speaking,
                    }}
                    disabled={submitting}
                    onPress={pronounce}
                    style={soundStyle}
                  >
                    <HearIcon
                      width={64}
                      height={64}
                      color={colors.qwPrimary}
                      accessible={false}
                    />
                  </Pressable>
                  <Text style={hearQuizStyles.subtitle}>
                    Schreibe das Wort:
                  </Text>
                  {hint && (
                    <Text
                      testID="hear-word-hint"
                      style={hearQuizStyles.hint}
                      accessibilityLiveRegion="polite"
                    >
                      {target.tip || "Du hast keinen Tipp hinterlegt."}
                    </Text>
                  )}
                  <View style={hearQuizStyles.inputRow}>
                    <TextInput
                      testID="hear-answer"
                      accessibilityLabel="Das gehörte Wort"
                      value={answer}
                      onChangeText={changeAnswer}
                      editable={!submitting}
                      autoComplete="off"
                      autoCorrect={false}
                      autoCapitalize="none"
                      returnKeyType="done"
                      onSubmitEditing={nextQuestion}
                      style={hearQuizStyles.input}
                      placeholder="Deine Antwort ..."
                    />
                    <Pressable
                      testID="toggle-hear-hint"
                      accessibilityRole="button"
                      accessibilityLabel="Tipp anzeigen oder ausblenden"
                      accessibilityState={{
                        expanded: hint,
                        disabled: submitting,
                      }}
                      disabled={submitting}
                      onPress={toggleHint}
                      style={helpStyle}
                    >
                      <Text style={hearQuizStyles.helpText}>?</Text>
                    </Pressable>
                  </View>
                  {submitError ? (
                    <Text
                      style={hearQuizStyles.message}
                      accessibilityRole="alert"
                    >
                      {submitError}
                    </Text>
                  ) : null}
                  <Pressable
                    testID="next-hear-question"
                    accessibilityRole="button"
                    onPress={nextQuestion}
                    disabled={!canContinue}
                    accessibilityState={{
                      disabled: !canContinue,
                      busy: submitting,
                    }}
                    style={continueStyle}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        !canContinue && styles.buttonTextDisabled,
                      ]}
                    >
                      {submitting ? "Wird abgegeben …" : "Weiter"}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
