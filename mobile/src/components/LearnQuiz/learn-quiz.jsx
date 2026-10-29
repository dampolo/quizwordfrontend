import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useQuiz from "@quizword/shared/quiz/useQuiz";
import CloseIcon from "../../../assets/icons/xbox.svg";
import PreLoader from "../PreLoader/pre-loader";
import { styles } from "../../styles/styles";
import { learnQuizStyles } from "./learn-quiz.styles";

function buttonStyle({ pressed }) {
  return [styles.button, pressed && styles.pressed];
}

function closeStyle({ pressed }) {
  return [learnQuizStyles.closeButton, pressed && styles.pressed];
}

export default function LearnQuiz() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const language = Array.isArray(params.language)
    ? params.language[0]
    : params.language;
  const redirect =
    (Array.isArray(params.redirect) ? params.redirect[0] : params.redirect) ===
    "true";
  const { getQuizWords } = useQuiz();
  const getQuizWordsRef = useRef(getQuizWords);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    getQuizWordsRef.current = getQuizWords;
  }, [getQuizWords]);

  useFocusEffect(
    useCallback(() => {
      // Changing the attempt restarts loading after a retry.
      void attempt;
      let active = true;
      setLoading(true);
      setQuiz(null);
      setCurrentQuestion(0);
      setError("");

      async function loadQuiz() {
        try {
          if (!id) throw new Error("Missing quiz id");
          const result = await getQuizWordsRef.current(id);
          if (!Array.isArray(result?.concepts))
            throw new Error("Missing quiz words");
          if (active) setQuiz(result);
        } catch {
          if (active) {
            const message =
              "Das Quiz konnte nicht geladen werden. Bitte versuche es erneut.";
            setError(message);
            Alert.alert("Quiz konnte nicht geladen werden", message);
          }
        } finally {
          if (active) setLoading(false);
        }
      }

      void loadQuiz();
      return () => {
        active = false;
      };
    }, [id, attempt]),
  );

  const concepts = quiz?.concepts ?? [];
  const word = concepts[currentQuestion];
  const totalQuestions = concepts.length;
  const questionNumber = !loading && !error && word ? currentQuestion + 1 : 0;
  const progress = totalQuestions ? (questionNumber / totalQuestions) * 100 : 0;

  function nextWord() {
    if (loading || !concepts.length) return;
    setCurrentQuestion((previous) => (previous + 1) % concepts.length);
  }

  function retry() {
    setAttempt((previous) => previous + 1);
  }

  function cancel() {
    if (!redirect && router.canGoBack()) {
      router.back();
      return;
    }
    router.dismissTo({
      pathname: "/my-quiz/(all-quizzes)/all-quizzes",
      params: { language: language || "" },
    });
  }

  return (
    <SafeAreaView
      style={learnQuizStyles.screen}
      edges={["top", "right", "bottom", "left"]}
    >
      <ScrollView contentContainerStyle={learnQuizStyles.content}>
        <View style={learnQuizStyles.card}>
          <View
            testID="learn-quiz-progress"
            style={learnQuizStyles.progress}
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
              style={[learnQuizStyles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <View style={learnQuizStyles.header}>
            <Text style={learnQuizStyles.quizName} accessibilityRole="header">
              {quiz?.quiz_name || "Lernen"}
            </Text>
            <Pressable
              testID="close-learn-quiz"
              accessibilityRole="button"
              accessibilityLabel="Lernen beenden"
              onPress={cancel}
              style={closeStyle}
            >
              <CloseIcon width={25} height={25} accessible={false} />
            </Pressable>
          </View>
          {loading ? (
            <View style={learnQuizStyles.messageContainer}>
              <PreLoader />
            </View>
          ) : error ? (
            <View style={learnQuizStyles.messageContainer}>
              <Text style={learnQuizStyles.message} accessibilityRole="alert">
                {error}
              </Text>
              <Pressable
                testID="retry-learn-quiz"
                accessibilityRole="button"
                onPress={retry}
                style={buttonStyle}
              >
                <Text style={styles.buttonText}>Erneut versuchen</Text>
              </Pressable>
            </View>
          ) : !word ? (
            <Text style={learnQuizStyles.message}>
              Dieses Quiz enthält noch keine Wörter.
            </Text>
          ) : (
            <View
              style={learnQuizStyles.words}
              accessibilityLiveRegion="polite"
            >
              <Text style={learnQuizStyles.source} testID="learn-source-word">
                {word.translations?.[0]?.word || "–"}
              </Text>
              <View style={learnQuizStyles.answer}>
                <View style={learnQuizStyles.line} accessible={false} />
                <Text style={learnQuizStyles.target} testID="learn-target-word">
                  {word.translations?.[1]?.word || "–"}
                </Text>
              </View>
              <Pressable
                testID="next-learn-word"
                accessibilityRole="button"
                onPress={nextWord}
                style={buttonStyle}
              >
                <Text style={styles.buttonText}>Weiter</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
