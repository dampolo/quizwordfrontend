import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Tooltip from "@mui/material/Tooltip";
import useTextTranslation from "../../../context/translation/useTranslation";
import useVocabulary from "../../../context/vocabulary/useVocabulary";
import styles from "./Translation.module.scss";

function Translation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const conjugationDialogRef = useRef(null);
  const [submittedTranslation, setSubmittedTranslation] = useState(null);
  const [addAttempted, setAddAttempted] = useState(false);
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

  const { translate, translatedText, loading, error } = useTextTranslation();
  const translatedWord = translatedText?.translated_text?.trim() ?? "";
  const targetResults = translatedText?.target_results;

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading || !text.trim() || !source.trim() || !target.trim()) {
      return;
    }
    setAddAttempted(false);
    setSubmittedTranslation({ text: text.trim(), sourceId, targetId });
    await translate({
      text: text.trim(),
      source: source.trim(),
      target: target.trim(),
    });
  }

  const nativeId = String(nativeLanguage?.id ?? "");
  const canAdd = Boolean(
    submittedTranslation && translatedWord && !loading && !error,
  );
  const includesNativeLanguage =
    submittedTranslation &&
    (submittedTranslation.sourceId === nativeId ||
      submittedTranslation.targetId === nativeId);

  function handleAdd() {
    if (!canAdd) {
      return;
    }
    if (!includesNativeLanguage) {
      setAddAttempted(true);
      return;
    }
    const translations = [
      {
        language: submittedTranslation.sourceId,
        word: submittedTranslation.text,
      },
      { language: submittedTranslation.targetId, word: translatedWord },
    ];
    if (translations[0].language !== nativeId) {
      translations.reverse();
    }
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
      <h2>{t("NAVBAR.TRANSLATOR")}</h2>
      <div className={styles["translation-content"]}>
        <form onSubmit={handleSubmit}>
          <fieldset>
            <div className={styles["input-container"]}>
              <label htmlFor="translation-text">{t("TRANSLATOR.TEXT")}</label>
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
              <label htmlFor="translation-source">
                {t("TRANSLATOR.SOURCE_LANGUAGE")}
              </label>
              <select
                id="translation-source"
                name="source"
                value={sourceId}
                onChange={(event) => setSource(event.target.value)}
                required
              >
                <option value="">{t("TRANSLATOR.SELECT_LANGUAGE")}</option>
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
                aria-label={t("TRANSLATOR.SWAP_LANGUAGES")}
              >
                <img src="/assets/switch.svg" alt="" />
              </button>
            </div>

            <div className={styles["input-container"]}>
              <label htmlFor="translation-target">
                {t("TRANSLATOR.TARGET_LANGUAGE")}
              </label>
              <select
                id="translation-target"
                name="target"
                value={targetId}
                onChange={(event) => setTarget(event.target.value)}
                required
              >
                <option value="">{t("TRANSLATOR.SELECT_LANGUAGE")}</option>
                {languageOptions.map((language) => (
                  <option key={language.id} value={String(language.id)}>
                    {language.language_name}
                  </option>
                ))}
              </select>
            </div>
            {sourceId && targetId && (!source || !target) && (
              <p role="alert">{t("TRANSLATOR.MISSING_LANGUAGE_CODE")}</p>
            )}
            <button
              type="submit"
              className={styles["main-quiz-button"]}
              disabled={
                loading || !text.trim() || !source.trim() || !target.trim()
              }
            >
              {t(loading ? "TRANSLATOR.TRANSLATING" : "TRANSLATOR.SUBMIT")}
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
          <div className={styles["result-header"]}>
            <h3>{t("TRANSLATOR.RESULT")}</h3>
            <Tooltip
              title={t(translatedText?.target_conjugations
                ? "TRANSLATOR.VIEW_CONJUGATIONS"
                : "TRANSLATOR.NO_CONJUGATIONS")}
              placement="top"
              arrow
              describeChild
            >
              <span className={styles["conjugation-tooltip"]}>
                <button
                  type="button"
                  className={styles["conjugation-button"]}
                  disabled={!translatedText?.target_conjugations}
                  aria-label={t("TRANSLATOR.CONJUGATIONS")}
                  aria-haspopup="dialog"
                  onClick={() => conjugationDialogRef.current?.showModal()}
                >
                  <img src="/assets/table.svg" alt="" />
                </button>
              </span>
            </Tooltip>
          </div>
          {translatedText ? (
            <p className={styles["translation-result"]}>
              {translatedText.translated_text}
            </p>
          ) : (
            <span>---</span>
          )}

          <div className={styles["action"]}>
            {addAttempted && canAdd && !includesNativeLanguage && (
              <p className={styles["info"]}>
                {t("TRANSLATOR.NATIVE_LANGUAGE_REQUIRED")}
              </p>
            )}
            <button
              type="button"
              className={`main-quiz-button ${styles["add-word"]}`}
              disabled={!canAdd}
              onClick={handleAdd}
              aria-label={t("TRANSLATOR.ADD_WORD")}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <dialog
        ref={conjugationDialogRef}
        className={styles["conjugation-dialog"]}
        aria-labelledby="conjugation-dialog-title"
      >
        <div className={styles["conjugation-header"]}>
          <h3 id="conjugation-dialog-title">
            {t("TRANSLATOR.CONJUGATIONS")} ·{" "}
            {targetResults?.verb?.infinitive ?? translatedWord}
          </h3>
          <header>
            <button
              type="button"
              className={styles["conjugation-close"]}
              aria-label={t("YOUR_VOCABULARY.CLOSE")}
              onClick={() => conjugationDialogRef.current?.close()}
            >
              <img width={25} height={25} src="/assets/xbox.svg" alt="" />
            </button>
          </header>
        </div>
        <div
          className={styles["conjugation-content"]}
          lang={targetResults?.verb?.lang}
        >
          {Object.entries(targetResults?.moods ?? {}).map(([mood, tenses]) => (
            <section key={mood} className={styles["conjugation-mood"]}>
              <h4>{mood.replaceAll("-", " ")}</h4>
              <div className={styles["conjugation-tenses"]}>
                {Object.entries(tenses).map(([tense, forms]) => (
                  <div key={tense} className={styles["conjugation-tense"]}>
                    <h5>{tense.replaceAll("-", " ")}</h5>
                    <ul>
                      {forms.flatMap(({ c }) => c).map((form, index) => (
                        <li key={index}>{form}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </dialog>
    </section>
  );
}

export default Translation;
