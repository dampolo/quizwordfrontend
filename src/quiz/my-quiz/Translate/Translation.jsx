import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTranslation from "../../../context/translation/useTranslation";
import useVocabulary from "../../../context/vocabulary/useVocabulary";
import styles from "./Translation.module.scss";

function Translation() {
  const navigate = useNavigate();
  const [submittedTranslation, setSubmittedTranslation] = useState(null);
  const [text, setText] = useState("");
  const { nativeLanguage, userLanguages = [] } = useVocabulary();
  const languageOptions = [nativeLanguage, ...userLanguages].filter(
    (language, index, all) =>
      language?.id &&
      all.findIndex((item) => item?.id === language.id) === index,
  );
  const getCode = (language) => {
    const code = (language?.language_code || language?.code || "").trim();
    // The translation endpoint accepts de/en/es; speech uses regional codes.
    const baseCode = code.toLowerCase().split(/[-_]/)[0];
    return ["de", "en", "es", "fr"].includes(baseCode) ? baseCode : code;
  };

  const [selectedSource, setSource] = useState(() =>
    localStorage.getItem("translation.sourceId"),
  );

  const [selectedTarget, setTarget] = useState(() =>
    localStorage.getItem("translation.targetId"),
  );

  const sourceId = selectedSource ?? String(nativeLanguage?.id ?? "");
  const targetId = selectedTarget ?? String(userLanguages[0]?.id ?? "");
  const source = getCode(
    languageOptions.find((language) => String(language.id) === sourceId),
  );
  const target = getCode(
    languageOptions.find((language) => String(language.id) === targetId),
  );

  const { translate, translatedText, loading, error } = useTranslation();

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading || !text.trim() || !source.trim() || !target.trim()) return;
    setSubmittedTranslation({ text: text.trim(), sourceId, targetId });
    await translate({
      text: text.trim(),
      source: source.trim(),
      target: target.trim(),
    });
  }

  const nativeId = String(nativeLanguage?.id ?? "");
  const canAdd =
    submittedTranslation && translatedText.trim() && !loading && !error;
  const includesNativeLanguage =
    submittedTranslation &&
    (submittedTranslation.sourceId === nativeId ||
      submittedTranslation.targetId === nativeId);

  function handleAdd() {
    if (!canAdd || !includesNativeLanguage) return;
    const translations = [
      {
        language: submittedTranslation.sourceId,
        word: submittedTranslation.text,
      },
      { language: submittedTranslation.targetId, word: translatedText.trim() },
    ];
    if (translations[0].language !== nativeId) translations.reverse();
    navigate("/my-quiz/add-new-word", { state: { translations } });
  }

  function switchLanguage() {
    setSource(targetId);
    setTarget(sourceId);
  }

  useEffect(() => {
    if (selectedSource !== null) {
      localStorage.setItem("translation.sourceId", selectedSource);
    }
  }, [selectedSource]);

  useEffect(() => {
    if (selectedTarget !== null) {
      localStorage.setItem("translation.targetId", selectedTarget);
    }
  }, [selectedTarget]);

  return (
    <section className={styles["translation"]}>
      <h2>Übersetzer</h2>
      <div className={styles["translation-content"]}>
        <form onSubmit={handleSubmit}>
          <fieldset>
            <div className={styles["input-container"]}>
              <label htmlFor="translation-text">Text</label>
              <input
                id="translation-text"
                name="text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <div className={styles["input-container"]}>
              <label htmlFor="translation-source">Ausgangssprache</label>
              <select
                id="translation-source"
                name="source"
                value={sourceId}
                onChange={(event) => setSource(event.target.value)}
                required
              >
                <option value="">Wähle Sprache</option>
                {languageOptions.map((language) => (
                  <option key={language.id} value={String(language.id)}>
                    {language.language_name}
                  </option>
                ))}
              </select>
            </div>

            <div type="button" className={styles["switch"]}>
              <button
                className={styles["switch-button"]}
                type="button"
                onClick={switchLanguage}
                aria-label="Sprachen tauschen"
              >
                <img src="/assets/switch.svg" alt="switch language" />
              </button>
            </div>

            <div className={styles["input-container"]}>
              <label htmlFor="translation-target">Zielsprache</label>
              <select
                id="translation-target"
                name="target"
                value={targetId}
                onChange={(event) => setTarget(event.target.value)}
                required
              >
                <option value="">Wähle Sprache</option>
                {languageOptions.map((language) => (
                  <option key={language.id} value={String(language.id)}>
                    {language.language_name}
                  </option>
                ))}
              </select>
            </div>
            {sourceId && targetId && (!source || !target) && (
              <p role="alert">
                Für eine ausgewählte Sprache fehlt der Sprachcode. Bitte lade
                die Seite nach dem Backend-Update neu.
              </p>
            )}
            <button
              type="submit"
              className={styles["main-quiz-button"]}
              disabled={
                loading || !text.trim() || !source.trim() || !target.trim()
              }
            >
              {loading ? "Wird übersetzt…" : "Übersetzen"}
            </button>
          </fieldset>
        </form>
        {/* {error && <p role="alert">{error}</p>} */}

        <hr />

        <div
          className={styles["result"]}
          aria-live="polite"
          aria-busy={loading}
        >
          <h3>Übersetzung: </h3>
          {translatedText ? (
            <p className={styles["translation-result"]}>{translatedText}</p>
          ) : (
            <span>---</span>
          )}
          <div className={styles["action"]}>
            {canAdd && !includesNativeLanguage && (
              <p className={styles["info"]}>
                Zum Hinzufügen muss eine der Sprachen deine Muttersprache sein.
              </p>
            )}
            <button
              type="button"
              className={`main-quiz-button ${styles["add-word"]}`}
              disabled={!canAdd || !includesNativeLanguage}
              onClick={handleAdd}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Translation;
