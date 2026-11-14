import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import useScreenWakeLock from "../../../../hooks/useScreenWakeLock";
import styles from "./word-audio-loop.module.scss";

function stopSession(session) {
  if (!session?.active) return;
  session.active = false;
  clearTimeout(session.timer);
  window.speechSynthesis.cancel();
}

export default function WordAudioLoop({ translations, onClose }) {
  const playback = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [answerHidden, setAnswerHidden] = useState(false);
  const screenAwake = useScreenWakeLock(playing);
  const [first, second] = translations;

  useEffect(() => () => stopSession(playback.current), []);

  function togglePlayback() {
    if (playing) {
      stopSession(playback.current);
      setPlaying(false);
      return;
    }

    const { speechSynthesis, SpeechSynthesisUtterance } = window;
    if (!speechSynthesis || !SpeechSynthesisUtterance) {
      toast.error("Dein Browser unterstützt keine Sprachausgabe.");
      return;
    }

    const session = { active: true, timer: null, utterance: null };
    playback.current = session;
    speechSynthesis.cancel();
    setPlaying(true);

    function handleSpeechError() {
      if (!session.active) return;
      stopSession(session);
      setPlaying(false);
      toast.error("Die Sprachausgabe konnte nicht abgespielt werden.");
    }

    function speak(index) {
      if (!session.active) return;
      const translation = translations[index];
      const utterance = new SpeechSynthesisUtterance(translation.word);
      utterance.lang = translation.language_code || "";
      session.utterance = utterance;
      utterance.onend = () => {
        if (!session.active) return;
        session.timer = setTimeout(() => speak(1 - index), 700);
      };
      utterance.onerror = handleSpeechError;
      try {
        speechSynthesis.speak(utterance);
      } catch {
        handleSpeechError();
      }
    }

    speak(0);
  }

  return (
    <div >
      {screenAwake && (
        <p role="status" className={styles["quiz-card__wake-lock-message"]}>
          Der Bildschirm bleibt während der Wiedergabe eingeschaltet.
        </p>
      )}

      <section className={`${styles["quiz-card"]} ${styles["learn-card"]}`}>
        <span className={styles.languages}>
          {first.language_name} → {second.language_name}
        </span>
        <button
          type="button"
          className={styles["quiz-card__cancel"]}
          aria-label="Schließen"
          onClick={onClose}
        >
          <img width={25} height={25} src="/assets/xbox.svg" alt="" />
        </button>
        <div className={styles["quiz-card__header"]}>
          <h2
            id="word-audio-title"
            className={styles["quiz-card__title-learn"]}
          >
            {first.word}
          </h2>
        </div>
        <div className={styles["quiz-card__form"]}>
          {answerHidden && (
            <div className={styles.overlay} aria-hidden="true" />
          )}
          <span className={styles["quiz-card__line"]}></span>
          <span
            className={styles["quiz-card__answer-wrapper-learn"]}
            aria-hidden={answerHidden}
          >
            {second.word}
          </span>
          <button
            type="button"
            className={styles["quiz-card__toggle-answer"]}
            onClick={() => setAnswerHidden((hidden) => !hidden)}
            aria-label={
              answerHidden ? "Antwort anzeigen" : "Antwort ausblenden"
            }
            aria-pressed={answerHidden}
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
          className="main-quiz-button"
          onClick={togglePlayback}
          aria-pressed={playing}
        >
          {playing ? "Stoppen" : "Starten"}
        </button>
      </section>
    </div>
  );
}
