import { useEffect, useId, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import useVocabulary from "../../../../context/vocabulary/useVocabulary";
import useScreenWakeLock from "../../../../hooks/useScreenWakeLock";
import PreLoader from "../../../../components/PreLoader/PreLoader";
import styles from "./random-repead-words.module.scss";

function RandomRepeadWords() {
  const { getRandomRepeatWords } = useVocabulary();
  const [params] = useSearchParams();
  const language = params.get("language");
  const navigate = useNavigate();
  const [conceptIndex, setConceptIndex] = useState(0);
  const indexRef = useRef(0);
  const dialogRef = useRef(null);
  const settingsRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [concepts, setConcepts] = useState([]);
  const [answerHidden, setAnswerHidden] = useState(false);
  const [pause, setPause] = useState(() => {
    try {
      const seconds = Number(localStorage.getItem("random-repeat-words:pause-seconds"));
      return [1, 2, 3, 5].includes(seconds) ? seconds * 1000 : 1000;
    } catch {
      return 1000;
    }
  });
  const [manual, setManual] = useState(false);
  const [error, setError] = useState("");
  const titleId = useId();
  const answerId = useId();
  const pauseId = useId();
  const manualId = useId();
  const settingsId = useId();
  const settingsTitleId = useId();
  const current = concepts[conceptIndex];
  const screenAwake = useScreenWakeLock(playing);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal?.();
    return () => dialog.close?.();
  }, []);

  useEffect(() => {
    if (!language) return;
    const controller = new AbortController();
    const storageKey = `random-repeat-words:${language}`;

    function validConcepts(data) {
      const items = Array.isArray(data) ? data : data?.concepts ?? data?.results;
      if (!Array.isArray(items)) return [];
      return items.filter((word) => word?.translations?.[0]?.word && word?.translations?.[1]?.word);
    }

    async function loadWords() {
      setLoading(true);
      setPlaying(false);
      setConceptIndex(0);
      indexRef.current = 0;
      setError("");
      setConcepts([]);
      try {
        const data = await getRandomRepeatWords(language, { signal: controller.signal });
        if (controller.signal.aborted) return;
        let items = validConcepts(data);
        if (!items.length) throw new Error("Keine Wörter zum Wiederholen vorhanden.");
        try {
          localStorage.setItem(storageKey, JSON.stringify(items));
          items = validConcepts(JSON.parse(localStorage.getItem(storageKey)));
        } catch {
          toast.error("Die Wörter konnten nicht lokal gespeichert werden. Die Wiedergabe läuft für diese Sitzung weiter.");
        }
        setConcepts(items);
      } catch (error) {
        if (!controller.signal.aborted) {
          const message = error.message || "Zufällige Wörter konnten nicht geladen werden.";
          setError(message);
          toast.error(message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadWords();
    return () => controller.abort();
  }, [language, getRandomRepeatWords]);

  useEffect(() => {
    if (!playing || !concepts.length) return;
    const controller = new AbortController();
    let timer;

    function fail(message) {
      if (controller.signal.aborted) return;
      controller.abort();
      window.speechSynthesis.cancel();
      setLoading(false);
      setPlaying(false);
      setError(message);
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
        else if (manual) setPlaying(false);
        else timer = setTimeout(() => {
          playWord((indexRef.current + 1) % concepts.length);
        }, pause);
      };
      utterance.onerror = () => fail("Die Sprachausgabe konnte nicht abgespielt werden.");
      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        utterance.onerror();
      }
    }

    function playWord(index = indexRef.current) {
      if (controller.signal.aborted) return;
      indexRef.current = index;
      const word = concepts[index];
      setConceptIndex(index);
      speak(word, 0);
    }

    playWord();
    return () => {
      controller.abort();
      clearTimeout(timer);
      window.speechSynthesis?.cancel();
    };
  }, [playing, concepts, pause, manual]);

  function handlePauseChange(event) {
    const milliseconds = Number(event.target.value);
    setPause(milliseconds);
    try {
      localStorage.setItem("random-repeat-words:pause-seconds", String(milliseconds / 1000));
    } catch {
      toast.error("Die Pause konnte nicht lokal gespeichert werden.");
    }
  }

  function togglePlayback() {
    if (!playing && (!window.speechSynthesis || !window.SpeechSynthesisUtterance)) {
      setError("Dein Browser unterstützt keine Sprachausgabe.");
      toast.error("Dein Browser unterstützt keine Sprachausgabe.");
      return;
    }
    setError("");
    setPlaying((value) => !value);
  }

  return (
    <dialog ref={dialogRef} className={`play-quiz ${styles.player}`} aria-labelledby={titleId}
      onCancel={() => navigate(`/my-quiz/all-words?${params}`)}>
      <div className={`${styles["quiz-card"]} ${styles["learn-card"]}`} aria-busy={loading}>
        <span className={styles.languages}>
          {current?.translations[0].language_name} → {current?.translations[1].language_name}
        </span>
        <h1 id={titleId} className="visually-hidden">Zufällige Wörter wiederholen</h1>
        <button type="button" name="close" className={styles["quiz-card__cancel"]}
          aria-label="Zurück zu allen Wörtern" onClick={() => navigate(`/my-quiz/all-words?${params}`)}>
          <img width={25} height={25} src="/assets/xbox.svg" alt="" />
        </button>
        <div className={styles["quiz-card__header"]}>
          {loading && !current ? <div aria-hidden="true"><PreLoader /></div> : (
            <p data-word="source" className={styles["quiz-card__title-learn"]} lang={current?.translations[0].language_code}>
              {current?.translations[0].word || "Starte die Wiederholung."}
            </p>
          )}
        </div>
        <div className={styles["quiz-card__form"]}>
          {answerHidden && <div className={styles.overlay} aria-hidden="true" />}
          <span className={styles["quiz-card__line"]} />
          <span id={answerId} aria-hidden={answerHidden} lang={current?.translations[1].language_code}
            className={styles["quiz-card__answer-wrapper-learn"]}>{current?.translations[1].word}</span>
          <button type="button" name="toggle-answer" className={styles["quiz-card__toggle-answer"]}
            onClick={() => setAnswerHidden((value) => !value)} disabled={!current}
            aria-label="Antwort ausblenden" aria-controls={answerId} aria-pressed={answerHidden}>
            <img width={24} height={24} src={answerHidden ? "/assets/eye.svg" : "/assets/eye-off.svg"} alt="" />
          </button>
        </div>
        <div className={styles["quiz-card__playback-controls"]}>
        <button type="button" name="random-repeat" className="main-quiz-button"
          onClick={togglePlayback} disabled={!language || loading || !concepts.length} aria-pressed={playing}>
          {playing ? "Stoppen" : "Starten"}
        </button>
          <button type="button" name="next-word" aria-label="Nächstes Wort"
            className={`next-button ${styles["next-button"]}`}
            disabled={!manual || playing || loading || !concepts.length}
            onClick={() => {
              indexRef.current = (indexRef.current + 1) % concepts.length;
              setConceptIndex(indexRef.current);
            }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        <button type="button" name="open-settings" className={styles["quiz-card__settings-button"]}
          aria-label="Einstellungen öffnen" aria-haspopup="dialog" aria-controls={settingsId}
          onClick={() => {
            setPlaying(false);
            settingsRef.current.showModal();
          }}>
          <img src="/assets/settings.svg" width={24} height={24} alt="" />
        </button>
        <dialog ref={settingsRef} id={settingsId} className={styles["settings-dialog"]}
          aria-labelledby={settingsTitleId} onCancel={(event) => event.stopPropagation()}>
          <button type="button" name="close-settings" className={styles["settings-dialog__close"]}
            aria-label="Einstellungen schließen" onClick={() => settingsRef.current.close()}>
            <img src="/assets/xbox.svg" width={25} height={25} alt="" />
          </button>
          <h2 id={settingsTitleId}>Einstellungen</h2>
          <div className={styles["quiz-card__settings"]}>
          <label htmlFor={pauseId}>Pause zwischen Wörtern</label>
          <select id={pauseId} name="pause" value={pause} disabled={playing || manual}
            onChange={handlePauseChange}>
            <option value={1000}>1 Sekunde</option>
            <option value={2000}>2 Sekunden</option>
            <option value={3000}>3 Sekunden</option>
            <option value={5000}>5 Sekunden</option>
          </select>
          <label htmlFor={manualId}>
            <input id={manualId} name="manual" type="checkbox" checked={manual} disabled={playing}
              onChange={(event) => setManual(event.target.checked)} />
            Wörter manuell wechseln
          </label>
          </div>
        </dialog>
      </div>
      <p role="status" aria-live="polite" aria-atomic="true" className={styles["quiz-card__status"]}>
        {error || (loading ? "Wörter werden geladen." : !language ? "Bitte wähle zuerst eine Sprache aus."
          : playing ? `Wiedergabe läuft.${screenAwake ? " Der Bildschirm bleibt eingeschaltet." : ""}`
          : concepts.length ? `${concepts.length} Wörter bereit. Wiedergabe gestoppt.` : "Keine Wörter vorhanden.")}
      </p>
    </dialog>
  );
}

export default RandomRepeadWords;
