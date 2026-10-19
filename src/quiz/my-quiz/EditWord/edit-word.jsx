import useVocabulary from "../../../context/useVocabulary";
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import useDialog from "../../../context/DialogContext/useDialog";
import BackButton from "../../../components/BackButton/BackButton";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import PreLoader from "../../../components/PreLoader/PreLoader";

import styles from "./edit-word.module.scss";

function validateTranslations(translations) {
  if (
    !Array.isArray(translations) ||
    translations.length !== 2 ||
    translations.some((translation) => !translation)
  ) {
    throw new Error("Expected a source and target translation.");
  }
}

function normalizeTranslation(translation) {
  return {
    id: translation.id,
    word: translation.word ?? "",
    tip: translation.tip ?? "",
    sentence: translation.sentence ?? "",
    category_id: translation.category_id ?? "",
    language: translation.language ?? "",
  };
}

export default function EditWord() {
  const {
    getConcept,
    updateWord,
    deleteWord,
    categories,
    getFiltredCategories,
    loading,
    nativeLanguage,
    userLanguages,
    clearCategories,
  } = useVocabulary();

  const { openDialog } = useDialog();

  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const languageId = searchParams.get("language");
  const targetWord = searchParams.get("target-word");

  const navigate = useNavigate();

  const [moreSource, setMoreSource] = useState(false);
  const [moreTarget, setMoreTarget] = useState(false);

  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    translations: [
      {
        id: "",
        word: "",
        tip: "",
        sentence: "",
        category_id: "",
        language: "",
      },
      {
        id: "",
        word: "",
        tip: "",
        sentence: "",
        category_id: "",
        language: "",
      },
    ],
  });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updateWord(Number(id), formData);
      toast.success(`Wort "${formData.translations[1].word}" wurde geändert!`);
      navigate(
        `/my-quiz/all-words?language=${formData.translations[1].language}`,
      );
    } catch (err) {
      console.error(err);

      const message = err.language || "Failed to update the word.";

      toast.error(message);
    }
  }

  function updateTranslation(index, changes) {
    setFormData((prev) => ({
      ...prev,
      translations: prev.translations.map((translation, i) =>
        i === index
          ? {
              ...translation,
              ...changes,
            }
          : translation,
      ),
    }));
  }

  function handleLanguageChange(index, value) {
    updateTranslation(index, { language: value, category_id: "" });
    clearCategories();
  }

  function handleChange(index, e) {
    const { name, value } = e.target;

    if (name === "language") {
      handleLanguageChange(index, value);
      return;
    }

    updateTranslation(index, { [name]: value });
  }

  function handleDelete() {
    openDialog({
      title: "Löschen?",
      description: "Bist du sicher?",
      confirmText: "Löschen",
      cancelText: "Abbrechen",
      confirmButtonClass: "main-quiz-button",
      cancelButtonClass: "main-quiz-button-cancel",

      onConfirm: deleteCurrentWord,
    });
  }

  async function deleteCurrentWord() {
    try {
      await deleteWord(Number(targetWord));
      toast.success(`Wort "${formData.translations[1].word}" wurde gelöscht!`);
      navigate(
        `/my-quiz/all-words?language=${formData.translations[1].language}`,
      );
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function loadConcept() {
      try {
        const data = await getConcept(id, languageId);
        if (ignore) return;

        validateTranslations(data?.translations);

        setFormData({
          translations: data.translations.map(normalizeTranslation),
        });
      } catch (err) {
        if (!ignore) {
          console.error(err);
          toast.error("Das Wort konnte nicht geladen werden.");
        }
      }
    }

    loadConcept();

    return () => {
      ignore = true;
    };
    // Reload only when id changes; other dependencies are intentionally ignored.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const targetLanguage = formData.translations[1]?.language;

  useEffect(() => {
    if (targetLanguage) {
      getFiltredCategories(targetLanguage);
    }
  }, [targetLanguage, getFiltredCategories]);

  if (loading) {
    return (
      <div className={styles["show-container"]}>
        <PreLoader />
      </div>
    );
  }

  return (
    <section className={styles["add-word-page"]}>
      <BackButton to={`/my-quiz/all-words?language=${languageId}`} />
      <header className={styles["page-header"]}>
        <div>
          <h1>Edit Dein Word</h1>
          <p>You can edit and adjust your word</p>
        </div>
      </header>

      <form className={styles["word-card"]} onSubmit={handleSubmit}>
        {categories.length > 0 && (
          <div
            className={`${styles["form-group"]} ${styles["category-group"]}`}
          >
            <label htmlFor="category">
              Kategorie <span>*</span>
            </label>

            <select
              name="category_id"
              value={formData.translations[1].category_id ?? ""}
              onChange={(e) => handleChange(1, e)}
            >
              <option value="">Wähle Kategorie</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <hr />
        <section className={styles["word-grid"]}>
          {/* Source Word */}
          <div
            className={`${styles["word-parent"]} ${moreSource ? styles["add-more-option"] : ""}`}
          >
            <div
              className={`${styles["word-panel"]} ${moreSource ? styles["add-more-option"] : ""}`}
            >
              <div className={styles["panel-title"]}>
                <span></span>
                <strong>SOURCE WORD</strong>
              </div>
              <div className={styles["source_word-contianer"]}>
                <div className={styles["source_word-input"]}>
                  <label htmlFor="source_word">
                    Term <span>*</span>
                  </label>
                  <input
                    name="word"
                    value={formData.translations[0].word}
                    onChange={(e) => handleChange(0, e)}
                    placeholder="e.g. Resilience"
                    autoComplete="off"
                    required
                  />
                </div>

                <div className={styles["source_word-lang"]}>
                  <label htmlFor="language">Lang:</label>

                  <select value={nativeLanguage?.id || ""} disabled>
                    <option value="">Wähle Sprache</option>

                    {nativeLanguage && (
                      <option value={nativeLanguage.id}>
                        {nativeLanguage.language_name}
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <label
                htmlFor="source_tip"
                className={moreSource ? "" : styles["source_tip"]}
              >
                Tip (Optional)
              </label>
              <input
                type="text"
                name="tip"
                value={formData.translations[0].tip}
                onChange={(e) => handleChange(0, e)}
                placeholder="Visualize a spring bouncing back"
              />

              <label htmlFor="source_sentence">
                Example Sentence (Optional)
              </label>
              <textarea
                name="sentence"
                value={formData.translations[0].sentence}
                onChange={(e) => handleChange(0, e)}
                placeholder="Her resilience after the setback was admirable."
              />
            </div>
            <div className={styles["button-container"]}>
              {!moreSource ? (
                <button
                  className={styles["more-source-button"]}
                  type="button"
                  onClick={() => setMoreSource((prev) => !prev)}
                >
                  mehr
                </button>
              ) : (
                <button
                  className={styles["more-source-button"]}
                  type="button"
                  onClick={() => setMoreSource((prev) => !prev)}
                >
                  weniger
                </button>
              )}
            </div>
          </div>
          {/* Target Word */}
          <div
            className={`${styles["word-parent"]} ${
              moreTarget ? styles["add-more-option"] : ""
            }`}
          >
            <div
              className={`${styles["word-panel"]} ${styles["green"]} ${
                moreTarget ? styles["add-more-option"] : ""
              }`}
            >
              <div className={styles["panel-title"]}>
                <span></span>
                <strong>TARGET WORD</strong>
              </div>
              <div className={styles["target_word-contianer"]}>
                <div className={styles["target_word-input"]}>
                  <label htmlFor="target_word">
                    Translation <span>*</span>
                  </label>
                  <input
                    type="text"
                    name="word"
                    value={formData.translations[1].word || ""}
                    onChange={(e) => handleChange(1, e)}
                    placeholder="e.g. Resiliencia"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className={styles["target_word-lang"]}>
                  <label htmlFor="language">Lang:</label>

                  <select
                    name="language"
                    value={formData.translations[1]?.language}
                    onChange={(e) => handleChange(1, e)}
                    required
                  >
                    <option value="">Wähle</option>
                    {userLanguages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.language_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label
                htmlFor="target_tip"
                className={moreTarget ? "" : styles["target_tip"]}
              >
                Tip (Optional)
              </label>
              <input
                type="text"
                name="tip"
                value={formData.translations[1].tip}
                onChange={(e) => handleChange(1, e)}
                placeholder="Sounds like 'silence' at the end"
                autoComplete="off"
              />

              <label htmlFor="target_sentence">
                Example Sentence (Optional)
              </label>
              <textarea
                name="sentence"
                value={formData.translations[1].sentence}
                onChange={(e) => handleChange(1, e)}
                placeholder="Su resiliencia tras el revés fue admirable."
              />
            </div>
            <div className={styles["button-container"]}>
              {!moreTarget ? (
                <button
                  className={styles["more-target-button"]}
                  type="button"
                  onClick={() => setMoreTarget((prev) => !prev)}
                >
                  mehr
                </button>
              ) : (
                <button
                  className={styles["more-target-button"]}
                  type="button"
                  onClick={() => setMoreTarget((prev) => !prev)}
                >
                  weniger
                </button>
              )}
            </div>
          </div>
        </section>

        <div className={styles["pro-tip"]}>
          <span>💡</span>
          <div>
            <strong>Pro Tip</strong>
            <p>
              Adding an example sentence helps our AI generate better flashcard
              variations for your next study session.
            </p>
          </div>
        </div>

        <hr />

        <div className={styles["action-buttons"]}>
          <button
            type="button"
            onClick={handleDelete}
            className={styles["delete-button"]}
          >
            <img width={24} height={24} src="/assets/trash.svg" alt="trash" />
          </button>

          <Link
            to={`/my-quiz/all-words?language=${formData.translations[1].language}`}
            className={`${styles["main-quiz-button-cancel"]} ${styles["cancel-btn"]}`}
          >
            {t("BUTTONS.CANCEL")}
          </Link>
          <button
            type="submit"
            className={`${styles["main-quiz-button"]} ${styles["save-btn"]}`}
          >
            {t("BUTTONS.CHANGE")}
          </button>
        </div>
      </form>
    </section>
  );
}
