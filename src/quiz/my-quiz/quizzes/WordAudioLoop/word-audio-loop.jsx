import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import useQuiz from "../../../../context/quiz/useQuiz";
import PreLoader from "../../../../components/PreLoader/PreLoader";
import styles from "./word-audio-loop.module.scss";
import useScreenWakeLock from "../../../../hooks/useScreenWakeLock";

function WordAudioLoop({ reverse = false }) {
  const firstTranslation = reverse ? 1 : 0;
  const secondTranslation = reverse ? 0 : 1;
  const { id } = useParams();
  const { getQuizWords } = useQuiz();
  const loadQuiz = useRef(getQuizWords);
  const playback = useRef({ active: false, timer: null });
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [playing, setPlaying] = useState(false);
  const screenAwake = useScreenWakeLock(playing);
  const [answerHidden, setAnswerHidden] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const language = searchParams.get("language");
  const redirect = searchParams.get("redirect") === "true";
  const concepts =
    quiz?.concepts?.filter(
      (concept) =>
        concept.translations?.[0]?.word && concept.translations?.[1]?.word,
    ) ?? [];
  const current = concepts[currentQuestion];

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setQuiz(null);
      setCurrentQuestion(0);
      setPlaying(false);
      try {
        const data = await loadQuiz.current(id);
        if (mounted) setQuiz(data);
      } catch {
        if (mounted) toast.error("Das Quiz konnte nicht geladen werden.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
      const session = playback.current;
      session.active = false;
      clearTimeout(session.timer);
      window.speechSynthesis?.cancel();
    };
  }, [id]);

  function stop() {
    playback.current.active = false;
    clearTimeout(playback.current.timer);
    window.speechSynthesis?.cancel();
    setPlaying(false);
  }

  function togglePlayback() {
    if (playing) {
      stop();
      return;
    }
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      toast.error("Dein Browser unterstützt keine Sprachausgabe.");
      return;
    }
    if (!concepts.length) return;
    // Each start has its own session so cancelled callbacks cannot restart it.
    const session = { active: true, timer: null, utterance: null };
    playback.current = session;
    window.speechSynthesis.cancel();
    setPlaying(true);

    function speak(index, translationIndex) {
      if (!session.active) return;
      setCurrentQuestion(index);
      const translation = concepts[index].translations[translationIndex];
      const utterance = new window.SpeechSynthesisUtterance(translation.word);
      utterance.lang =
        translation.language_code ||
        (translationIndex === 0 ? "de-DE" : "en-GB");
      session.utterance = utterance;
      utterance.onend = () => {
        if (!session.active) return;
        session.timer = setTimeout(() => {
          speak(
            translationIndex === firstTranslation ? index : (index + 1) % concepts.length,
            translationIndex === firstTranslation ? secondTranslation : firstTranslation,
          );
        }, 700);
      };
      utterance.onerror = () => {
        if (!session.active) return;
        stop();
        toast.error("Die Sprachausgabe konnte nicht abgespielt werden.");
      };
      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        utterance.onerror();
      }
    }
    speak(currentQuestion, firstTranslation);
  }

  function cancel() {
    stop();
    navigate(
      redirect
        ? `/my-quiz/all-quizzes?language=${language}`
        : `/my-quiz/${id}/all-quiz-words?language=${language}`,
    );
  }

  return (
    <section className="play-quiz">
      <div className={`${styles["quiz-card"]} ${styles["learn-card"]}`}>
        <span className={styles["languages"]}>
          {current?.translations[firstTranslation].language_name} →{" "}
          {current?.translations[secondTranslation].language_name}
        </span>
        <span className={styles["quiz-card__quiz-name"]}>
          {quiz?.quiz_name}
        </span>
        <button
          type="button"
          name="close"
          className={styles["quiz-card__cancel"]}
          onClick={cancel}
        >
          <img width={25} height={25} src="/assets/xbox.svg" alt="Close" />
        </button>
        <div className={styles["quiz-card__header"]}>
          {loading ? (
            <PreLoader />
          ) : (
            <h1 className={styles["quiz-card__title-learn"]}>
              {current?.translations[firstTranslation].word || "Keine Wörter vorhanden."}
            </h1>
          )}
        </div>
        <div className={styles["quiz-card__form"]}>
          {answerHidden && <div className={styles["overlay"]} aria-hidden="true" />}
          <span className={styles["quiz-card__line"]}></span>
          <span className={styles["quiz-card__answer-wrapper-learn"]}>
            {current?.translations[secondTranslation].word}
          </span>
        <button
          type="button"
          name="toggle-answer"
          className={styles["quiz-card__toggle-answer"]}
          onClick={() => setAnswerHidden((hidden) => !hidden)}
          aria-label={answerHidden ? "Antwort anzeigen" : "Antwort ausblenden"}
          aria-pressed={answerHidden}
          disabled={loading || !current}
        >
          <img
            width={24}
            height={24}
            src={answerHidden ? "/assets/eye.svg" : "/assets/eye-off.svg"}
            alt=""
          />
        </button>
        </div>
        <button
          type="button"
          name="audio-loop"
          className="main-quiz-button"
          onClick={togglePlayback}
          disabled={loading || !current}
          aria-pressed={playing}
        >
          <span>{playing ? "Stoppen" : "Starten"}</span>
        </button>
      </div>
        {screenAwake && (
          <p role="status" className={styles["quiz-card__wake-lock-message"]}>
            Der Bildschirm bleibt während der Wiedergabe eingeschaltet.
          </p>
        )}
    </section>
  );
}

export default WordAudioLoop;
