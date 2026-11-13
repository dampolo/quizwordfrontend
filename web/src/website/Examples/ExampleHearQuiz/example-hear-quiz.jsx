import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SpeakButton from "../../../components/SpeakButton/SpeakButton";
import styles from "../../../quiz/my-quiz/quizzes/HearQuiz/hear-quiz.module.scss";

const speechLocales = { de: "de-DE", en: "en-GB", es: "es-ES", fr: "fr-FR" };

export default function ExampleHearQuiz({
  title,
  words,
  t,
  sourceLanguage = "de",
  targetLanguage = "en",
  resultsClassName = "examples__words",
}) {
  const { i18n } = useTranslation();
  const inputId = useId();
  const hintId = useId();
  const playback = useRef(null);
  const [answers, setAnswers] = useState([]);
  const [answer, setAnswer] = useState("");
  const [hint, setHint] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [failed, setFailed] = useState(false);
  const word = words[answers.length];
  const targetWord = word?.[targetLanguage];
  const languageNames = new Intl.DisplayNames(i18n.resolvedLanguage, {
    type: "language",
  });
  const questionNumber = Math.min(answers.length + 1, words.length);
  const canSpeak = Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);

  useEffect(() => () => {
    if (playback.current) {
      playback.current = null;
      window.speechSynthesis.cancel();
    }
  }, []);

  function stopPlayback() {
    if (playback.current) {
      playback.current = null;
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }

  function playAudio() {
    stopPlayback();
    setFailed(false);
    const utterance = new window.SpeechSynthesisUtterance(targetWord);
    utterance.lang = speechLocales[targetLanguage] ?? targetLanguage;
    playback.current = utterance;
    setSpeaking(true);

    utterance.onend = () => {
      if (playback.current === utterance) stopPlayback();
    };
    function handleError() {
      if (playback.current !== utterance) return;
      stopPlayback();
      setFailed(true);
    }
    utterance.onerror = handleError;

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      handleError();
    }
  }

  function submitAnswer(event) {
    event.preventDefault();
    const submittedAnswer = answer.trim();
    if (!word || submittedAnswer.length < 2) return;
    stopPlayback();
    setAnswers([...answers, {
      word,
      submittedAnswer,
      correct: submittedAnswer.toLowerCase() === targetWord.toLowerCase(),
    }]);
    setAnswer("");
    setHint(false);
    setFailed(false);
  }

  return (
    <div className={styles["quiz-card"]}>
      <div
        className={styles.progress}
        role="progressbar"
        aria-label={t("PROGRESS")}
        aria-valuemin={0}
        aria-valuemax={words.length}
        aria-valuenow={questionNumber}
      >
        <span
          className={styles["progress__fill"]}
          style={{ width: `${words.length ? (questionNumber / words.length) * 100 : 0}%` }}
        />
      </div>
      <span className={styles["quiz-card__languages"]}>
        {languageNames.of(sourceLanguage)} → {languageNames.of(targetLanguage)}
      </span>
      <span id="example-quiz-title" className={styles["quiz-card__quiz-name"]}>
        {title}
      </span>
      <form method="dialog">
        <button className={styles["quiz-card__cancel"]} aria-label={t("CLOSE")}>
          <img width={25} height={25} src="/assets/xbox.svg" alt="" />
        </button>
      </form>

      {word ? (
        <>
          <div className={styles["quiz-card__header"]}>
            <button
              type="button"
              className={styles["quiz-card__title"]}
              aria-label={t("PLAY_AUDIO")}
              disabled={!canSpeak}
              onClick={playAudio}
            >
              <SpeakButton speakActive={speaking} />
            </button>
          </div>
          {(!canSpeak || failed) && (
            <p className={styles["quiz-card__subtitle"]} role="status">
              {t("AUDIO_UNAVAILABLE")}
            </p>
          )}
          <p className={styles["quiz-card__subtitle"]}>Schreibe das Wort:</p>
          <div className={styles["hint-container"]}>
            <div id={hintId} className={styles[hint ? "show-hint" : "hide-hint"]}>
              <p className={styles["hint-text"]}>Du hast keinen Tipp hinterlegt.</p>
            </div>
          </div>
          <form className={styles["quiz-card__form"]} onSubmit={submitAnswer}>
            <label htmlFor={inputId} className={styles["quiz-card__label"]}>
              Your Translation
            </label>
            <div className={styles["quiz-card__input-wrapper"]}>
              <input
                id={inputId}
                name="answer"
                type="text"
                placeholder="Type your answer here..."
                className={styles["quiz-card__input"]}
                aria-describedby={hint ? hintId : undefined}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                lang={targetLanguage}
                required
              />
              <button
                type="button"
                className={styles["quiz-card__help"]}
                aria-label={t("HINT")}
                aria-controls={hintId}
                aria-expanded={hint}
                title="Klick um Hinweis zu sehen"
                onClick={() => setHint((visible) => !visible)}
              >
                ?
              </button>
            </div>
            <button
              type="submit"
              className={`main-quiz-button ${styles["play-button"]}`}
              disabled={answer.trim().length < 2}
            >
              <span>Weiter</span>
            </button>
          </form>
        </>
      ) : (
        <>
          <h2 className={styles["quiz-card__subtitle"]} role="status">
            {t("SCORE", {
              correct: answers.filter((entry) => entry.correct).length,
              total: words.length,
            })}
          </h2>
          <ul className={resultsClassName}>
            {answers.map(({ word, submittedAnswer, correct }) => (
              <li key={word[sourceLanguage]}>
                <span lang={sourceLanguage}>{word[sourceLanguage]}</span>
                <span lang={targetLanguage}>
                  {correct ? submittedAnswer : (
                    <><s>{submittedAnswer}</s> → {word[targetLanguage]}</>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={`main-quiz-button ${styles["play-button"]}`}
            onClick={() => setAnswers([])}
          >
            {t("RESTART")}
          </button>
        </>
      )}
    </div>
  );
}
