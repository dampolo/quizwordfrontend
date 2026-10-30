import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState, Pressable, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useKeepAwake } from "expo-keep-awake";
import useQuiz from "@quizword/shared/quiz/useQuiz";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import CloseIcon from "../../../assets/icons/xbox.svg";
import EyeIcon from "../../../assets/icons/eye.svg";
import EyeOffIcon from "../../../assets/icons/eye-off.svg";
import PreLoader from "../PreLoader/pre-loader";
import { speak, stopSpeaking } from "../../services/speech";
import { styles } from "../../styles/styles";
import { wordAudioLoopStyles } from "./word-audio-loop.styles";


function hasTranslations(concept) {
  return Boolean(concept.translations?.[0]?.word && concept.translations?.[1]?.word);
}


function clearPlayback(playback) {
  const current = playback.current;
  playback.current = null;
  if (current) {
    current.active = false;
    clearTimeout(current.timer);
    void stopSpeaking().catch(() => {});
  }
}


function buttonStyle({ pressed }) {
  return [styles.button, pressed && styles.pressed];
}


function closeStyle({ pressed }) {
  return [styles.closeButton, pressed && styles.pressed];
}


function PlaybackWakeLock() {
  useKeepAwake(undefined, { suppressDeactivateWarnings: true });
  return (
    <Text style={wordAudioLoopStyles.wakeMessage} accessibilityLiveRegion="polite">
      Der Bildschirm bleibt während der Wiedergabe eingeschaltet.
    </Text>
  );
}


export default function WordAudioLoop({ reverse = false }) {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const language = Array.isArray(params.language) ? params.language[0] : params.language;
  const redirect = (Array.isArray(params.redirect) ? params.redirect[0] : params.redirect) === "true";
  const firstTranslation = reverse ? 1 : 0;
  const secondTranslation = reverse ? 0 : 1;
  const { getQuizWords } = useQuiz();
  const { languages, userLanguages, nativeLanguage } = useVocabulary();
  const loadQuizRef = useRef(getQuizWords);
  const loadVersion = useRef(0);
  const playback = useRef(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [answerHidden, setAnswerHidden] = useState(false);
  const [activeTranslation, setActiveTranslation] = useState(null);

  useEffect(() => {
    loadQuizRef.current = getQuizWords;
  }, [getQuizWords]);

  const stopPlayback = useCallback(() => {
    clearPlayback(playback);
    setPlaying(false);
    setActiveTranslation(null);
  }, []);

  useFocusEffect(useCallback(() => {
    void attempt;
    void reverse;
    const currentLoad = ++loadVersion.current;
    stopPlayback();
    setLoading(true);
    setQuiz(null);
    setError("");
    setCurrentQuestion(0);
    setAnswerHidden(false);


    async function loadQuiz() {
      try {
        if (!id) {
          throw new Error("Missing quiz id");
        }
        const data = await loadQuizRef.current(id);
        if (!Array.isArray(data?.concepts)) {
          throw new Error("Missing quiz words");
        }
        if (loadVersion.current === currentLoad) {
          setQuiz({ ...data, concepts: data.concepts.filter(hasTranslations) });
        }
      } catch {
        if (loadVersion.current === currentLoad) {
          const message = "Das Quiz konnte nicht geladen werden. Bitte versuche es erneut.";
          setError(message);
          Alert.alert("Audio-Wiederholung", message);
        }
      } finally {
        if (loadVersion.current === currentLoad) {
          setLoading(false);
        }
      }
    }


    function handleAppState(state) {
      if (state !== "active") {
        stopPlayback();
      }
    }


    const subscription = AppState.addEventListener("change", handleAppState);
    void loadQuiz();
    return () => {
      loadVersion.current += 1;
      subscription.remove();
      stopPlayback();
    };
  }, [id, reverse, attempt, stopPlayback]));

  const concepts = quiz?.concepts ?? [];
  const current = concepts[currentQuestion];
  const first = current?.translations[firstTranslation];
  const second = current?.translations[secondTranslation];
  const controlsDisabled = loading || !current;
  const questionNumber = current ? currentQuestion + 1 : 0;
  const progress = concepts.length ? (questionNumber / concepts.length) * 100 : 0;


  function retry() {
    setAttempt((previous) => previous + 1);
  }


  function toggleAnswer() {
    setAnswerHidden((hidden) => !hidden);
  }


  function languageCode(translation) {
    const details = [nativeLanguage, ...(languages ?? []), ...(userLanguages ?? [])].find((entry) => String(entry?.id) === String(translation.language));
    return translation.language_code || details?.language_code || details?.code;
  }


  function togglePlayback() {
    if (playback.current?.active) {
      stopPlayback();
      return;
    }
    if (controlsDisabled) {
      return;
    }
    const run = { active: true, timer: null };
    playback.current = run;
    setPlaying(true);


    function speakTranslation(index, translationIndex) {
      if (!run.active || playback.current !== run) {
        return;
      }
      setCurrentQuestion(index);
      const translation = concepts[index].translations[translationIndex];
      let completed = false;
      let ended = false;


      function onStart() {
        if (run.active && playback.current === run) {
          setActiveTranslation(translationIndex);
        }
      }


      function onDone() {
        completed = true;
      }


      function continuePlayback() {
        const nextIndex = translationIndex === firstTranslation ? index : (index + 1) % concepts.length;
        const nextTranslation = translationIndex === firstTranslation ? secondTranslation : firstTranslation;
        speakTranslation(nextIndex, nextTranslation);
      }


      function onEnd() {
        if (ended || !run.active || playback.current !== run) {
          return;
        }
        ended = true;
        setActiveTranslation(null);
        if (!completed) {
          stopPlayback();
          return;
        }
        run.timer = setTimeout(continuePlayback, 700);
      }


      void speak(translation.word, languageCode(translation), { onStart, onDone, onEnd });
    }


    speakTranslation(currentQuestion, firstTranslation);
  }


  function cancel() {
    stopPlayback();
    if (!redirect && router.canGoBack()) {
      router.back();
      return;
    }
    router.dismissTo({ pathname: "/my-quiz/(all-quizzes)/all-quizzes", params: { language: language || "" } });
  }


  function playbackStyle({ pressed }) {
    return [styles.button, pressed && !controlsDisabled && styles.pressed, controlsDisabled && styles.buttonDisabled];
  }


  function answerStyle({ pressed }) {
    return [styles.closeButton, pressed && !controlsDisabled && styles.pressed, controlsDisabled && styles.buttonDisabled];
  }


  return (
    <SafeAreaView style={wordAudioLoopStyles.screen} edges={["top", "right", "bottom", "left"]}>
      <ScrollView contentContainerStyle={wordAudioLoopStyles.content}>
        <View style={wordAudioLoopStyles.card}>
          <View style={wordAudioLoopStyles.progress} testID="audio-loop-progress" pointerEvents="none" accessible accessibilityRole="progressbar" accessibilityLabel="Fortschritt der Wiederholung" accessibilityValue={{ min: 0, max: concepts.length || 1, now: questionNumber }}>
            <View style={[wordAudioLoopStyles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={wordAudioLoopStyles.quizName} numberOfLines={1}>{quiz?.quiz_name || "Audio-Wiederholung"}</Text>
          <View style={wordAudioLoopStyles.header}>
            <Text style={wordAudioLoopStyles.languages}>{first && second ? `${first.language_name || ""} → ${second.language_name || ""}` : "Lernen und hören"}</Text>
            <Pressable testID="close-audio-loop" accessibilityRole="button" accessibilityLabel="Audio-Wiederholung beenden" onPress={cancel} style={closeStyle}>
              <CloseIcon width={25} height={25} accessible={false} />
            </Pressable>
          </View>
          {loading ? <PreLoader /> : error ? (
            <View style={wordAudioLoopStyles.body}>
              <Text style={wordAudioLoopStyles.message} accessibilityRole="alert">{error}</Text>
              <Pressable testID="retry-audio-loop" accessibilityRole="button" onPress={retry} style={buttonStyle}>
                <Text style={styles.buttonText}>Erneut versuchen</Text>
              </Pressable>
            </View>
          ) : (
            <View style={wordAudioLoopStyles.body}>
              <Text testID="audio-loop-source" style={[wordAudioLoopStyles.source, activeTranslation === firstTranslation && wordAudioLoopStyles.speaking]}>{first?.word || "Keine Wörter vorhanden."}</Text>
              <View style={wordAudioLoopStyles.answerRow}>
                <View style={wordAudioLoopStyles.answer}>
                  <View style={wordAudioLoopStyles.line} accessible={false} />
                  <Text testID="audio-loop-answer" style={[wordAudioLoopStyles.target, activeTranslation === secondTranslation && wordAudioLoopStyles.speaking]} accessibilityLabel={answerHidden ? "Antwort ausgeblendet" : undefined}>{answerHidden && second ? "••••••" : second?.word}</Text>
                </View>
                <Pressable testID="toggle-audio-loop-answer" accessibilityRole="button" accessibilityLabel={answerHidden ? "Antwort anzeigen" : "Antwort ausblenden"} accessibilityState={{ selected: answerHidden, disabled: controlsDisabled }} disabled={controlsDisabled} onPress={toggleAnswer} style={answerStyle}>
                  {answerHidden ? <EyeIcon width={24} height={24} accessible={false} /> : <EyeOffIcon width={24} height={24} accessible={false} />}
                </Pressable>
              </View>
              <Pressable testID="toggle-audio-loop" accessibilityRole="button" accessibilityLabel={playing ? "Wiedergabe stoppen" : "Wiedergabe starten"} accessibilityState={{ selected: playing, disabled: controlsDisabled }} disabled={controlsDisabled} onPress={togglePlayback} style={playbackStyle}>
                <Text style={[styles.buttonText, controlsDisabled && styles.buttonTextDisabled]}>{playing ? "Stoppen" : "Starten"}</Text>
              </Pressable>
            </View>
          )}
        </View>
        {playing && <PlaybackWakeLock />}
      </ScrollView>
    </SafeAreaView>
  );
}
