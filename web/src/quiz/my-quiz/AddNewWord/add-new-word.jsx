import useVocabulary from "../../../context/vocabulary/useVocabulary";
import { useState, useEffect, useEffectEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import FormDialog from "../../../components/FormDialog/FormDialog";
import BackButton from "../../../components/BackButton/BackButton";
import PreLoader from "../../../components/PreLoader/PreLoader";
import { toast } from "react-toastify";
import useDialog from "../../../context/dialog/useDialog";
import { useTranslation } from "react-i18next";
import Tooltip from "@mui/material/Tooltip";

import styles from "./add-new-word.module.scss";

export default function AddNewWord() {
  const {
    categories,
    loading,
    createConcept,
    createCategory,
    getFiltredCategories,
    clearCategories,
    nativeLanguage,
    userLanguages,
  } = useVocabulary();

  const navigate = useNavigate();
  const { state } = useLocation();
  const [initialTranslations] = useState(() => state?.translations);
  const { openDialog } = useDialog();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categoryMessage, setCategoryMessage] = useState("");
  const [createdCategory, setCreatedCategory] = useState(null);
  const [moreSource, setMoreSource] = useState(false);
  const [moreTarget, setMoreTarget] = useState(false);

  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    category: "",
    translations: [
      {
        language: initialTranslations?.[0]?.language ?? "",
        word: initialTranslations?.[0]?.word ?? "",
        tip: "",
        sentence: "",
      },
      {
        language: initialTranslations?.[1]?.language ?? "",
        word: initialTranslations?.[1]?.word ?? "",
        tip: "",
        sentence: "",
      },
    ],
  });

  function getConceptPayload() {
    return {
      ...formData,
      translations: formData.translations.map((translation, index) =>
        index === 0
          ? { ...translation, language: nativeLanguage?.id ?? "" }
          : translation,
      ),
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const addAnother = e.nativeEvent.submitter?.value === "add-another";

    try {
      const data = await createConcept(getConceptPayload());

      // Confirmation needed
      if (data.requires_confirmation) {
        openDialog({
          title: "Weitere Bedeutung hinzufügen?",
          description: "Für dieses Wort existiert bereits eine Übersetzung.",
          confirmText: "Hinzufügen",
          cancelText: "Abbrechen",
          confirmButtonClass: "main-quiz-button",
          cancelButtonClass: "main-quiz-button-cancel",

          onConfirm: () => createNewConcept(addAnother),
        });

        return;
      }

      // Word already exists commt der Toast
      if (data.info?.length > 0) {
        toast.info(data.info[0]);
        return;
      }

      // Successfully created
      toast.success(
        `Wort "${formData.translations[1].word}" wurde hinzugefügt!`,
      );

      finishSave(addAnother);
    } catch (err) {
      const message =
        err.response?.translations?.[0] ||
        err.response?.detail ||
        "Etwas ist schiefgelaufen.";
      toast.error(message);
    }
  }

  function finishSave(addAnother) {
    if (addAnother) {
      setFormData((prev) => ({
        ...prev,
        translations: prev.translations.map((translation) => ({
          ...translation,
          word: "",
          tip: "",
          sentence: "",
        })),
      }));
      return;
    }

    navigate(
      `/my-quiz/all-words?language=${formData.translations[1].language}`,
    );
  }

  async function createNewConcept(addAnother) {
    try {
      const newFormData = {
        ...getConceptPayload(),
        allow_new_meaning: true,
      };
      await createConcept(newFormData);

      toast.success(
        `Wort "${formData.translations[1].word}" wurde hinzugefügt!`,
      );

      finishSave(addAnother);
    } catch (err) {
      toast.error(
        err.response?.translations?.[0] ||
          err.response?.detail ||
          "Etwas ist schiefgelaufen.",
      );
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
    updateTranslation(index, { language: value });
    clearCategories();
    setCreatedCategory(null);
    setFormData((prev) => ({ ...prev, category: "" }));

    if (index === 1 && value) {
      getFiltredCategories(value);
    }
  }

  async function handleCreateCategory(categoryName) {
    if (categorySubmitting || !formData.translations[1].language) return;
    setCategorySubmitting(true);
    setCategoryMessage("");
    try {
      const category = await createCategory({
        category_name: categoryName,
        language_id: formData.translations[1].language,
      });
      const categoryId = category.id;
      if (categoryId != null) {
        setCreatedCategory({
          category_id: categoryId,
          category_name: categoryName,
        });
        handleCategoryChange(categoryId);
      }
      await getFiltredCategories(formData.translations[1].language);
      setCategoryDialogOpen(false);
      toast.success(`Kategorie "${categoryName}" wurde hinzugefügt!`);
    } catch (error) {
      const detail = error.response?.category_name ?? error.response?.detail;
      const message =
        (Array.isArray(detail) ? detail[0] : detail) ||
        "Die Kategorie konnte nicht erstellt werden.";
      setCategoryMessage(message);
      toast.error(message);
    } finally {
      setCategorySubmitting(false);
    }
  }

  const categoryOptions =
    createdCategory &&
    !categories.some(
      (category) =>
        String(category.category_id) === String(createdCategory.category_id),
    )
      ? [...categories, createdCategory]
      : categories;

  function handleCategoryChange(value) {
    setFormData((prev) => ({ ...prev, category: value }));
  }

  function handleChange(index, e) {
    const { name, value } = e.target;

    if (name === "language") {
      handleLanguageChange(index, value);
      return;
    }

    if (name === "category") {
      if (value === "__add_category__") {
        setCategoryMessage("");
        setCategoryDialogOpen(true);
        return;
      }
      handleCategoryChange(value);
      return;
    }

    updateTranslation(index, { [name]: value });
  }

  const loadInitialCategories = useEffectEvent(() => {
    if (initialTranslations?.[1]?.language) {
      getFiltredCategories(initialTranslations[1].language);
    }
  });

  useEffect(() => {
    clearCategories();
    loadInitialCategories();
  }, [clearCategories]);

  if (loading) {
    return (
      <div className="show-container ">
        <PreLoader />
      </div>
    );
  }

  return (
    <section className={styles["add-word-page"]}>
      <BackButton to="/my-quiz/all-words/" />
      <header className={styles["page-header"]}>
        <div>
          <h1>Neues Wort hinzufügen</h1>
          <p>Erweitere deinen Wortschatz mit Kontext und Eselsbrücken.</p>
        </div>
      </header>

      <form className={styles["word-card"]} onSubmit={handleSubmit}>
        {formData.translations[1].language && (
          <div
            className={`${styles["form-group"]} ${styles["category-group"]}`}
          >
            <label htmlFor="word-category">
              Kategorie <span></span>
            </label>

            <select
              id="word-category"
              name="category"
              value={formData.category}
              onChange={(e) => handleChange(1, e)}
            >
              <option value="">Wähle Kategorie</option>
              {categoryOptions.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
              <option value="__add_category__" disabled={categorySubmitting}>
                + Kategorie hinzufügen
              </option>
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
                <strong>Ausgangswort</strong>
              </div>

              {/* source word container */}
              <div className={styles["source_word-contianer"]}>
                <div className={styles["source_word-input"]}>
                  <label htmlFor="source_word">
                    Begriff <span>*</span>
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
                  <label htmlFor="language">Sprache:</label>

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
              {/* source word container ende */}

              <label
                htmlFor="source_tip"
                className={moreTarget ? "" : styles["target_tip"]}
              >
                Tipp (Optional)
              </label>
              <input
                type="text"
                name="tip"
                value={formData.translations[0].tip}
                onChange={(e) => handleChange(0, e)}
                placeholder="Stell dir eine Feder vor, die zurückspringt"
                autoComplete="off"
              />

              <label htmlFor="source_sentence">Beispielsatz (Optional)</label>
              <textarea
                name="sentence"
                value={formData.translations[0].sentence}
                onChange={(e) => handleChange(0, e)}
                placeholder="Ihre Widerstandsfähigkeit nach dem Rückschlag war bewundernswert."
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
              className={`${styles["word-panel"]} ${styles.green} ${
                moreTarget ? styles["add-more-option"] : ""
              }`}
            >
              <div className={styles["panel-title"]}>
                <span></span>
                <strong>Zielwort</strong>
              </div>
              <div className={styles["target_word-contianer"]}>
                <div className={styles["target_word-input"]}>
                  <label htmlFor="target_word">
                    Begriff <span>*</span>
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
                  <label htmlFor="language">Sprache:</label>

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
                Tipp (Optional)
              </label>
              <input
                type="text"
                name="tip"
                value={formData.translations[1].tip}
                onChange={(e) => handleChange(1, e)}
                placeholder="Stell dir eine Feder vor, die zurückspringt"
                autoComplete="off"
              />

              <label htmlFor="target_sentence">Beispielsatz (Optional)</label>
              <textarea
                name="sentence"
                value={formData.translations[1].sentence}
                onChange={(e) => handleChange(1, e)}
                placeholder="Ihre Widerstandsfähigkeit nach dem Rückschlag war bewundernswert."
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
            <strong>Profi-Tipp</strong>
            <p>
              Ein Beispielsatz hilft unserer KI dabei, bessere
              Karteikartenvarianten für deine nächste Lerneinheit zu erstellen.
            </p>
          </div>
        </div>

        <hr />

        <div className={styles["action-buttons"]}>
          <Link
            to="/my-quiz/all-words"
            className={`${styles["main-quiz-button-cancel"]} ${styles["cancel-btn"]}`}
          >
            {t("BUTTONS.CANCEL")}
          </Link>
          <button
            type="submit"
            className={`${styles["main-quiz-button"]} ${styles["save-btn"]}`}
          >
            {t("BUTTONS.SAVE")}
          </button>
          <Tooltip title="Speicher und neues Wort hinzüfugen" placement="top" arrow>
            <button
              type="submit"
              value="add-another"
              className={`${styles["main-quiz-button"]} ${styles["save-btn"]}`}
            >
              {t("BUTTONS.SAVE")} +
            </button>
          </Tooltip>
        </div>
      </form>
      <FormDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        onSubmit={handleCreateCategory}
        dialogTitle="Neue Kategorie hinzufügen"
        dialogDescription="Gib einen Namen für die Kategorie in deiner gewählten Zielsprache ein."
        inputName="category_name"
        inputLabel="Kategoriename"
        formId="create-word-category-form"
        submitting={categorySubmitting}
        preserveInputOnSubmit
        message={categoryMessage}
      />
    </section>
  );
}