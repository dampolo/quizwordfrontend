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
import CloseIcon from "../../../assets/icons/xbox.svg";
import PreLoader from "../PreLoader/pre-loader";
import QuizResults from "../QuizResults/quiz-results";
import { styles } from "../../styles/styles";
import { playTestQuizStyles } from "./play-test-quiz.styles";

function buttonStyle({ pressed }) {
  return [styles.button, pressed && styles.pressed];
}

export default function PlayTestQuiz() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const language = Array.isArray(params.language)
    ? params.language[0]
    : params.language;
  const redirect =
    (Array.isArray(params.redirect) ? params.redirect[0] : params.redirect) ===
    "true";
  const { getQuizWords, postQuizAnswers } = useQuiz();
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
          if (!id) throw new Error("Missing quiz id");
          const data = await actions.current.getQuizWords(id);
          if (!Array.isArray(data?.concepts))
            throw new Error("Missing quiz words");
          for (const concept of data.concepts) {
            if (
              concept.id == null ||
              !concept.translations?.[0]?.word ||
              !concept.translations?.[1]?.word
            ) {
              throw new Error("Incomplete quiz word");
            }
          }
          if (session.current === currentSession) setQuiz(data);
        } catch {
          if (session.current === currentSession) {
            const message =
              "Das Quiz konnte nicht geladen werden. Bitte versuche es erneut.";
            setLoadError(message);
            Alert.alert("Quiz konnte nicht geladen werden", message);
          }
        } finally {
          if (session.current === currentSession) setLoading(false);
        }
      }

      void loadQuiz();
      return () => {
        session.current += 1;
      };
    }, [id, attempt]),
  );

  const concepts = quiz?.concepts ?? [];
  const question = concepts[currentQuestion];
  const source = question?.translations?.[0];
  const target = question?.translations?.[1];
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
    if (submitting) return;
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
    if (!canContinue || advancing.current) return;
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
      playTestQuizStyles.helpButton,
      pressed && styles.pressed,
      submitting && styles.buttonDisabled,
    ];
  }

  return (
    <SafeAreaView
      style={playTestQuizStyles.screen}
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
          style={playTestQuizStyles.keyboard}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={playTestQuizStyles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={playTestQuizStyles.card}>
              <View
                style={playTestQuizStyles.progress}
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
                    playTestQuizStyles.progressFill,
                    { width: `${progress}%` },
                  ]}
                />
              </View>
              <Text style={playTestQuizStyles.quizName} numberOfLines={1}>
                {quiz?.quiz_name || "Test"}
              </Text>
              <View style={playTestQuizStyles.header}>
                <Text style={playTestQuizStyles.languages}>
                  {source && target
                    ? `${source.language_name || ""} → ${target.language_name || ""}`
                    : "Test schreiben"}
                </Text>
                <Pressable
                  testID="close-test-quiz"
                  accessibilityRole="button"
                  accessibilityLabel="Test beenden"
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
                <View style={playTestQuizStyles.form}>
                  <Text
                    style={playTestQuizStyles.message}
                    accessibilityRole="alert"
                  >
                    {loadError}
                  </Text>
                  <Pressable
                    testID="retry-test-quiz"
                    accessibilityRole="button"
                    onPress={retry}
                    style={buttonStyle}
                  >
                    <Text style={styles.buttonText}>Erneut versuchen</Text>
                  </Pressable>
                </View>
              ) : !question ? (
                <Text style={playTestQuizStyles.message}>
                  Dieses Quiz enthält noch keine Wörter.
                </Text>
              ) : (
                <View style={playTestQuizStyles.form}>
                  <Text
                    style={playTestQuizStyles.title}
                    testID="test-source-word"
                    accessibilityRole="header"
                  >
                    {source.word}
                  </Text>
                  <Text style={playTestQuizStyles.subtitle}>
                    Übersetze das Wort:
                  </Text>
                  {hint && (
                    <Text
                      testID="test-word-hint"
                      style={playTestQuizStyles.hint}
                      accessibilityLiveRegion="polite"
                    >
                      {target.tip || "Du hast keinen Tipp hinterlegt."}
                    </Text>
                  )}
                  <View style={playTestQuizStyles.inputRow}>
                    <TextInput
                      testID="test-answer"
                      accessibilityLabel="Deine Übersetzung"
                      accessibilityLabelledBy="test-answer-label"
                      value={answer}
                      onChangeText={changeAnswer}
                      editable={!submitting}
                      autoComplete="off"
                      autoCorrect={false}
                      autoCapitalize="none"
                      returnKeyType="done"
                      onSubmitEditing={nextQuestion}
                      style={playTestQuizStyles.input}
                      placeholder="Deine Antwort ..."
                    />
                    <Pressable
                      testID="toggle-test-hint"
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
                      <Text style={playTestQuizStyles.helpText}>?</Text>
                    </Pressable>
                  </View>
                  {submitError ? (
                    <Text
                      style={playTestQuizStyles.message}
                      accessibilityRole="alert"
                    >
                      {submitError}
                    </Text>
                  ) : null}
                  <Pressable
                    testID="next-test-question"
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
