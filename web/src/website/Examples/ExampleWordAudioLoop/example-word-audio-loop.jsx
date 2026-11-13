import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../../quiz/my-quiz/quizzes/WordAudioLoop/word-audio-loop.module.scss";

function cancelPlayback(session) {
  if (!session) return;
  session.active = false;
  clearTimeout(session.timer);
  window.speechSynthesis.cancel();
}

const speechLocales = { de: "de-DE", en: "en-GB", es: "es-ES", fr: "fr-FR" };

export default function ExampleWordAudioLoop({
  title,
  words,
  onClose,
  reverse = false,
  sourceLanguage = "de",
  targetLanguage = "en",
}) {
  const { t, i18n } = useTranslation();
  const playback = useRef(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [failed, setFailed] = useState(false);
  const source = reverse ? targetLanguage : sourceLanguage;
  const target = reverse ? sourceLanguage : targetLanguage;
  const languageNames = new Intl.DisplayNames(i18n.resolvedLanguage, {
    type: "language",
  });
  const word = words[index];
  const canSpeak = Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);
  const label = (key) => t("WEBSITE.EXAMPLES." + key);

  useEffect(() => () => cancelPlayback(playback.current), []);

  function stop() {
    cancelPlayback(playback.current);
    playback.current = null;
    setPlaying(false);
  }

  function togglePlayback() {
    if (playing) {
      stop();
      return;
    }
    if (!canSpeak || !word) return;

    const session = { active: true, timer: null, utterance: null };
    playback.current = session;
    window.speechSynthesis.cancel();
    setFailed(false);
    setPlaying(true);

    function speak(wordIndex, language) {
      if (!session.active) return;
      setIndex(wordIndex);
      const utterance = new window.SpeechSynthesisUtterance(words[wordIndex][language]);
      utterance.lang = speechLocales[language] ?? language;
      session.utterance = utterance;
      utterance.onend = () => {
        if (!session.active) return;
        const firstWord = language === source;
        session.timer = setTimeout(() => {
          speak(firstWord ? wordIndex : (wordIndex + 1) % words.length, firstWord ? target : source);
        }, 700);
      };
      utterance.onerror = () => {
        if (!session.active) return;
        stop();
        setFailed(true);
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        utterance.onerror();
      }
    }

    speak(index, source);
  }

  const questionNumber = word ? index + 1 : 0;

  return (
    <div className={`${styles["quiz-card"]} ${styles["learn-card"]}`}>
      <span className={styles.languages}>
        {languageNames.of(source)} → {languageNames.of(target)}
      </span>
      <div
        className={styles.progress}
        role="progressbar"
        aria-label={label("PROGRESS")}
        aria-valuemin={0}
        aria-valuemax={words.length || 1}
        aria-valuenow={questionNumber}
      >
        <span
          className={styles["progress__fill"]}
          style={{ width: (questionNumber / (words.length || 1)) * 100 + "%" }}
        />
      </div>
      <span id="example-quiz-title" className={styles["quiz-card__quiz-name"]}>{title}</span>
      <button
        type="button"
        className={styles["quiz-card__cancel"]}
        aria-label={label("CLOSE")}
        onClick={onClose}
      >
        <img width={25} height={25} src="/assets/xbox.svg" alt="" />
      </button>
      <div className={styles["quiz-card__header"]}>
        <h2 className={styles["quiz-card__title-learn"]} lang={source}>{word?.[source]}</h2>
      </div>
      <div className={styles["quiz-card__form"]}>
        {hidden && <div className={styles.overlay} aria-hidden="true" />}
        <span className={styles["quiz-card__line"]} />
        <span className={styles["quiz-card__answer-wrapper-learn"]} lang={target} aria-hidden={hidden}>
          {word?.[target]}
        </span>
        <button
          type="button"
          className={styles["quiz-card__toggle-answer"]}
          aria-label={label(hidden ? "REVEAL" : "HIDE_TRANSLATION")}
          aria-pressed={hidden}
          onClick={() => setHidden((current) => !current)}
          disabled={!word}
        >
          <img width={24} height={24} src={hidden ? "/assets/eye.svg" : "/assets/eye-off.svg"} alt="" />
        </button>
      </div>
      <button
        type="button"
        className="main-quiz-button"
        onClick={togglePlayback}
        disabled={!canSpeak || !word}
      >
        {label(playing ? "STOP_AUDIO_LOOP" : "START_AUDIO_LOOP")}
      </button>
      {!canSpeak && <p role="status">{label("AUDIO_UNAVAILABLE")}</p>}
      {failed && <p role="status">{label("AUDIO_ERROR")}</p>}
    </div>
  );
}
