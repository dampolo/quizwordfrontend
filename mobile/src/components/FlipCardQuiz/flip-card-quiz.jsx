import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Animated, Easing, Pressable, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useQuiz from "@quizword/shared/quiz/useQuiz";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import CloseIcon from "../../../assets/icons/xbox.svg";
import HearIcon from "../../../assets/icons/hear.svg";
import PreviousIcon from "../../../assets/icons/arrow-left.svg";
import NextIcon from "../../../assets/icons/arrow-right.svg";
import TurnAroundIcon from "../../../assets/icons/turn-around.svg";
import PreLoader from "../PreLoader/pre-loader";
import { stopSpeaking } from "../../services/speech";
import { colors } from "../../styles/basic";
import { styles } from "../../styles/styles";
import { flipCardQuizStyles } from "./flip-card-quiz.styles";


function buttonStyle({ pressed }) {
  return [styles.button, pressed && styles.pressed];
}


function closeStyle({ pressed }) {
  return [styles.closeButton, pressed && styles.pressed];
}


export default function FlipCardQuiz({ reverse = false }) {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const language = Array.isArray(params.language) ? params.language[0] : params.language;
  const redirect = (Array.isArray(params.redirect) ? params.redirect[0] : params.redirect) === "true";
  const { getQuizWords } = useQuiz();
  const { speakWord, speakActive, activeSpeechId, languages, userLanguages, nativeLanguage } = useVocabulary();
  const loadQuizRef = useRef(getQuizWords);
  const [rotation] = useState(() => new Animated.Value(0));
  const transitioning = useRef(false);
  const session = useRef(0);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    loadQuizRef.current = getQuizWords;
  }, [getQuizWords]);

  useFocusEffect(useCallback(() => {
    void attempt;
    void reverse;
    const currentSession = ++session.current;
    rotation.stopAnimation();
    rotation.setValue(0);
    transitioning.current = false;
    setAnimating(false);
    setLoading(true);
    setQuiz(null);
    setError("");
    setCurrentQuestion(0);
    setIsFlipped(false);


    async function loadQuiz() {
      try {
        if (!id) {
          throw new Error("Missing quiz id");
        }
        const data = await loadQuizRef.current(id, true);
        if (!Array.isArray(data?.concepts)) {
          throw new Error("Missing quiz words");
        }
        for (const concept of data.concepts) {
          if (!concept.translations?.[0]?.word || !concept.translations?.[1]?.word) {
            throw new Error("Incomplete quiz word");
          }
        }
        if (session.current === currentSession) {
          setQuiz(data);
        }
      } catch {
        if (session.current === currentSession) {
          const message = "Die Karteikarten konnten nicht geladen werden. Bitte versuche es erneut.";
          setError(message);
          Alert.alert("Karteikarten", message);
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
      rotation.stopAnimation();
      void stopSpeaking();
    };
  }, [id, reverse, attempt, rotation]));

  const concepts = quiz?.concepts ?? [];
  const concept = concepts[currentQuestion];
  const front = concept?.translations?.[reverse ? 1 : 0];
  const back = concept?.translations?.[reverse ? 0 : 1];
  const visibleWord = isFlipped ? back : front;
  const total = concepts.length;
  const questionNumber = !loading && !error && concept ? currentQuestion + 1 : 0;
  const progress = total ? (questionNumber / total) * 100 : 0;
  const speechId = visibleWord?.id ?? `${id}-${currentQuestion}-${isFlipped}`;
  const speaking = speakActive && activeSpeechId === speechId;
  const controlsDisabled = loading || !concept || animating;
  const animatedStyle = {
    transform: [{ perspective: 760 }, { rotateY: rotation.interpolate({ inputRange: [-90, 90], outputRange: ["-90deg", "90deg"] }) }],
  };


  function retry() {
    setAttempt((previous) => previous + 1);
  }


  function changeQuestion(direction) {
    setCurrentQuestion((previous) => (previous + direction + total) % total);
    setIsFlipped(false);
  }


  function animateFlip(nextFace, direction = 0) {
    if (controlsDisabled || transitioning.current) {
      return;
    }
    void stopSpeaking();
    transitioning.current = true;
    setAnimating(true);
    const currentSession = session.current;


    function finishFlip({ finished }) {
      if (session.current !== currentSession) {
        return;
      }
      transitioning.current = false;
      setAnimating(false);
      if (finished && direction) {
        changeQuestion(direction);
      }
    }


    function changeFace({ finished }) {
      if (session.current !== currentSession) {
        return;
      }
      if (!finished) {
        transitioning.current = false;
        setAnimating(false);
        rotation.setValue(0);
        return;
      }
      setIsFlipped(nextFace);
      rotation.setValue(-90);
      Animated.timing(rotation, { toValue: 0, duration: 200, easing: Easing.linear, useNativeDriver: true }).start(finishFlip);
    }


    Animated.timing(rotation, { toValue: 90, duration: 200, easing: Easing.linear, useNativeDriver: true }).start(changeFace);
  }


  function turnAround() {
    animateFlip(!isFlipped);
  }


  function navigateCard(direction) {
    if (controlsDisabled || transitioning.current) {
      return;
    }
    if (isFlipped) {
      animateFlip(false, direction);
    } else {
      void stopSpeaking();
      changeQuestion(direction);
    }
  }


  function previousCard() {
    navigateCard(-1);
  }


  function nextCard() {
    navigateCard(1);
  }


  function pronounce() {
    if (controlsDisabled || transitioning.current || !visibleWord) {
      return;
    }
    const languageDetails = [nativeLanguage, ...(languages ?? []), ...(userLanguages ?? [])].find((entry) => String(entry?.id) === String(visibleWord.language));
    const code = visibleWord.language_code || languageDetails?.language_code || languageDetails?.code;
    speakWord(visibleWord.word, code, speechId);
  }


  function cancel() {
    void stopSpeaking();
    if (!redirect && router.canGoBack()) {
      router.back();
      return;
    }
    router.dismissTo({ pathname: "/my-quiz/(all-quizzes)/all-quizzes", params: { language: language || "" } });
  }


  function navigationStyle({ pressed }) {
    return [styles.button, flipCardQuizStyles.navigationButton, pressed && !controlsDisabled && styles.pressed, controlsDisabled && styles.buttonDisabled];
  }


  function turnStyle({ pressed }) {
    return [flipCardQuizStyles.iconButton, pressed && !controlsDisabled && styles.pressed, controlsDisabled && styles.buttonDisabled];
  }


  function soundStyle({ pressed }) {
    return [flipCardQuizStyles.iconButton, speaking && flipCardQuizStyles.speaking, pressed && !controlsDisabled && styles.pressed, controlsDisabled && styles.buttonDisabled];
  }


  return (
    <SafeAreaView style={flipCardQuizStyles.screen} edges={["top", "right", "bottom", "left"]}>
      <ScrollView contentContainerStyle={flipCardQuizStyles.content}>
        <View style={flipCardQuizStyles.frame}>
          <Animated.View style={[flipCardQuizStyles.card, animatedStyle]}>
            <View style={flipCardQuizStyles.progress} testID="flip-card-progress" pointerEvents="none" accessible accessibilityRole="progressbar" accessibilityLabel="Quizfortschritt" accessibilityValue={{ min: 0, max: total || 1, now: questionNumber }}>
              <View style={[flipCardQuizStyles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={flipCardQuizStyles.quizName} numberOfLines={1}>{quiz?.quiz_name || "Karteikarten"}</Text>
            <View style={flipCardQuizStyles.header}>
              <Text style={flipCardQuizStyles.languages}>
                {front && back ? (isFlipped ? back.language_name : `${front.language_name || ""} → ${back.language_name || ""}`) : "Karteikarten"}
              </Text>
              <Pressable testID="close-flip-card" accessibilityRole="button" accessibilityLabel="Karteikarten beenden" onPress={cancel} style={closeStyle}>
                <CloseIcon width={25} height={25} accessible={false} />
              </Pressable>
            </View>
            {loading ? <PreLoader /> : error ? (
              <View style={flipCardQuizStyles.messageContainer}>
                <Text style={flipCardQuizStyles.message} accessibilityRole="alert">{error}</Text>
                <Pressable testID="retry-flip-card" accessibilityRole="button" onPress={retry} style={buttonStyle}>
                  <Text style={styles.buttonText}>Erneut versuchen</Text>
                </Pressable>
              </View>
            ) : !concept ? (
              <Text style={flipCardQuizStyles.message}>Dieses Quiz enthält noch keine Karteikarten.</Text>
            ) : (
              <View style={flipCardQuizStyles.body}>
                <View style={flipCardQuizStyles.soundRow}>
                  <Pressable testID="speak-flip-card" accessibilityRole="button" accessibilityLabel="Wort vorlesen" accessibilityState={{ disabled: controlsDisabled, busy: speaking }} disabled={controlsDisabled} onPress={pronounce} style={soundStyle}>
                    <HearIcon width={28} height={28} accessible={false} />
                  </Pressable>
                </View>
                <View style={flipCardQuizStyles.wordArea} accessibilityLiveRegion="polite" accessibilityLabel={isFlipped ? "Rückseite" : "Vorderseite"}>
                  {isFlipped && <View style={flipCardQuizStyles.line} accessible={false} />}
                  <Text testID="flip-card-word" style={[flipCardQuizStyles.word, isFlipped && flipCardQuizStyles.backWord]}>{visibleWord.word}</Text>
                </View>
                {isFlipped && Boolean(back.sentence) && <Text testID="flip-card-sentence" style={flipCardQuizStyles.sentence}>{back.sentence}</Text>}
                <View style={flipCardQuizStyles.buttons}>
                  <Pressable testID="previous-flip-card" accessibilityRole="button" accessibilityLabel="Vorherige Karte" accessibilityState={{ disabled: controlsDisabled }} disabled={controlsDisabled} onPress={previousCard} style={navigationStyle}>
                    <PreviousIcon width={32} height={32} stroke={colors.qwFourth} strokeLinejoin="round" accessible={false} />
                  </Pressable>
                  <Pressable testID="next-flip-card" accessibilityRole="button" accessibilityLabel="Nächste Karte" accessibilityState={{ disabled: controlsDisabled }} disabled={controlsDisabled} onPress={nextCard} style={navigationStyle}>
                    <NextIcon width={32} height={32} stroke={colors.qwFourth} strokeLinejoin="round" accessible={false} />
                  </Pressable>
                  <Pressable testID="turn-flip-card" accessibilityRole="button" accessibilityLabel="Karte umdrehen" accessibilityState={{ disabled: controlsDisabled, expanded: isFlipped }} disabled={controlsDisabled} onPress={turnAround} style={turnStyle}>
                    <TurnAroundIcon width={48} height={48} accessible={false} />
                  </Pressable>
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
