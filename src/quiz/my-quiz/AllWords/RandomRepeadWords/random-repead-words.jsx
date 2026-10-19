import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import useVocabulary from "../../../../context/useVocabulary";
import useScreenWakeLock from "../../../../hooks/useScreenWakeLock";
import PreLoader from "../../../../components/PreLoader/PreLoader";
import styles from "./random-repead-words.module.scss";

function RandomRepeadWords() {
  const { getRandomRepeatWords } = useVocabulary();
  const [params] = useSearchParams();
  const language = params.get("language");
  const navigate = useNavigate();
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [answerHidden, setAnswerHidden] = useState(false);
  const screenAwake = useScreenWakeLock(playing);

  useEffect(() => {
    if (!playing || !language) return;
    const controller = new AbortController();
    let pending = false;
    let timer;

    function fail(message) {
      if (controller.signal.aborted) return;
      controller.abort();
      window.speechSynthesis.cancel();
      setLoading(false);
      setPlaying(false);
      toast.error(message);
    }

    function speak(word, index) {
      if (controller.signal.aborted) return;
      const translation = word.translations[index];
      const utterance = new window.SpeechSynthesisUtterance(translation.word);
      utterance.lang = translation.language_code || (index === 0 ? "de-DE" : "en-GB");
      utterance.onend = () => {
        if (controller.signal.aborted) return;
        if (index === 0) speak(word, 1);
        else timer = setTimeout(loadWord, 1000);
      };
      utterance.onerror = () => fail("Die Sprachausgabe konnte nicht abgespielt werden.");
      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        utterance.onerror();
      }
    }

    async function loadWord() {
      if (pending) return;
      pending = true;
      setLoading(true);
      try {
        const data = await getRandomRepeatWords(language, { signal: controller.signal });
        if (controller.signal.aborted) return;
        const word = Array.isArray(data) ? data[0] : data.results ? data.results[0] : data;
        if (!word?.translations?.[0]?.word || !word?.translations?.[1]?.word) {
          throw new Error("Keine Wörter zum Wiederholen vorhanden.");
        }
        setCurrent(word);
        speak(word, 0);
      } catch (error) {
        if (!controller.signal.aborted) {
          fail(error.message || "Zufällige Wörter konnten nicht geladen werden.");
        }
      } finally {
        pending = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadWord();
    return () => {
      controller.abort();
      clearTimeout(timer);
      window.speechSynthesis?.cancel();
    };
  }, [playing, language, getRandomRepeatWords]);

  function togglePlayback() {
    if (!playing && (!window.speechSynthesis || !window.SpeechSynthesisUtterance)) {
      toast.error("Dein Browser unterstützt keine Sprachausgabe.");
      return;
    }
    setPlaying((value) => !value);
  }

  return (
    <section className="play-quiz">
      <div className={`${styles["quiz-card"]} ${styles["learn-card"]}`}>
        <span className={styles.languages}>
          {current?.translations[0].language_name} → {current?.translations[1].language_name}
        </span>
        <span className={styles["quiz-card__quiz-name"]}>Zufällige Wörter</span>
        <button type="button" name="close" className={styles["quiz-card__cancel"]}
          onClick={() => navigate(`/my-quiz/all-words?${params}`)}>
          <img width={25} height={25} src="/assets/xbox.svg" alt="Close" />
        </button>
        <div className={styles["quiz-card__header"]}>
          {loading && !current ? <PreLoader /> : (
            <h1 className={styles["quiz-card__title-learn"]}>
              {current?.translations[0].word || "Starte die Wiederholung."}
            </h1>
          )}
        </div>
        <div className={styles["quiz-card__form"]}>
          {answerHidden && <div className={styles.overlay} aria-hidden="true" />}
          <span className={styles["quiz-card__line"]} />
          <span className={styles["quiz-card__answer-wrapper-learn"]}>{current?.translations[1].word}</span>
          <button type="button" name="toggle-answer" className={styles["quiz-card__toggle-answer"]}
            onClick={() => setAnswerHidden((value) => !value)} disabled={!current}
            aria-label={answerHidden ? "Antwort anzeigen" : "Antwort ausblenden"} aria-pressed={answerHidden}>
            <img width={24} height={24} src={answerHidden ? "/assets/eye.svg" : "/assets/eye-off.svg"} alt="" />
          </button>
        </div>
        <button type="button" name="random-repeat" className="main-quiz-button"
          onClick={togglePlayback} disabled={!language} aria-pressed={playing}>
          {playing ? "Stoppen" : "Starten"}
        </button>
      </div>
      {screenAwake && <p role="status" className={styles["quiz-card__wake-lock-message"]}>
        Der Bildschirm bleibt während der Wiedergabe eingeschaltet.
      </p>}
    </section>
  );
}

export default RandomRepeadWords;
