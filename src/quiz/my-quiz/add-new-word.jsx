// import "./add-new-word.scss";
import useVocabulary from "../../context/useVocabulary";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton/BackButton";
import PreLoader from "../../components/PreLoader/PreLoader";
import { toast } from "react-toastify";
import useDialog from "../../context/DialogContext/useDialgo";
import { useTranslation } from "react-i18next";

export default function AddNewWord() {
  const {
    categories,
    loading,
    createConcept,
    getFiltredCategories,
    clearCategories,
    nativeLanguage,
    userLanguages,
  } = useVocabulary();

  const navigate = useNavigate();
  const { openDialog } = useDialog();
  const [moreSource, setMoreSource] = useState(false);
  const [moreTarget, setMoreTarget] = useState(false);

  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    category: "",
    translations: [
      {
        language: "",
        word: "",
        tip: "",
        sentence: "",
      },
      {
        language: "",
        word: "",
        tip: "",
        sentence: "",
      },
    ],
  });

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const data = await createConcept(formData);

      // Confirmation needed
      if (data.requires_confirmation) {
        openDialog({
          title: "Weitere Bedeutung hinzufügen?",
          description: "Für dieses Wort existiert bereits eine Übersetzung.",
          confirmText: "Hinzufügen",
          cancelText: "Abbrechen",
          confirmButtonClass: "main-quiz-button",
          cancelButtonClass: "main-quiz-button-cancel",

          onConfirm: createNewConcept,
        });

        return;
      }

      // Word already exists
      if (data.info?.length > 0) {
        toast.info(data.info[0]);
        return;
      }

      // Successfully created
      toast.success(
        `Wort "${formData.translations[1].word}" wurde hinzugefügt!`,
      );

      navigate(
        `/my-quiz/all-words?language=${formData.translations[1].language}`,
      );
    } catch (err) {
      const message =
        err.response?.translations?.[0] || err.response?.detail?.[0] || "Error";

      toast.error(message);
    }
  }

  async function createNewConcept() {
    try {
      const newFormData = {
        ...formData,
        allow_new_meaning: true,
      };

      await createConcept(newFormData);

      toast.success(
        `Wort "${formData.translations[1].word}" wurde hinzugefügt!`,
      );

      navigate(
        `/my-quiz/all-words?language=${formData.translations[1].language}`,
      );
    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(index, e) {
    const { name, value } = e.target;

    if (name === "language") {
      setFormData((prev) => ({
        ...prev,
        category: "",
        translations: prev.translations.map((translation, i) =>
          i === index ? { ...translation, language: value } : translation,
        ),
      }));

      clearCategories();

      if (index === 1 && value) {
        getFiltredCategories(value);
      }

      return;
    }

    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        category: value,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      category: "",
      translations: prev.translations.map((translation, i) =>
        i === index
          ? {
              ...translation,
              [name]: value,
            }
          : translation,
      ),
    }));
  }

  useEffect(() => {
    if (!formData.language_id) return;
    getFiltredCategories(formData.language_id);
  }, [formData.language_id]);

  useEffect(() => {
    clearCategories();
  }, []);

  useEffect(() => {
    if (!nativeLanguage) return;

    setFormData((prev) => ({
      ...prev,
      translations: prev.translations.map((translation, index) =>
        index === 0
          ? {
              ...translation,
              language: nativeLanguage.id,
            }
          : translation,
      ),
    }));
  }, [nativeLanguage]);

  if (loading) {
    return (
      <div className="show-container ">
        <PreLoader />
      </div>
    );
  }

  return (
    <section className="add-word-page">
      <BackButton to="/my-quiz/all-words/" />
      <header className="page-header">
        <div>
          <h1>Neues Wort hinzufügen</h1>
          <p>Erweitere deinen Wortschatz mit Kontext und Eselsbrücken.</p>
        </div>
      </header>

      <form className="word-card" onSubmit={handleSubmit}>
        {/* <div className="form-group category-group">
          <label htmlFor="language_name">
            Sprache <span>*</span>
          </label>

          <select
            name="language_id"
            value={formData.language_id}
            onChange={handleChange}
          >
            <option value="">Wähle Sprache</option>
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.language_name}
              </option>
            ))}
          </select>
        </div> */}

        {categories.length > 0 && (
          <div className="form-group category-group">
            <label>
              Kategorie <span></span>
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={(e) => handleChange(1, e)}
            >
              <option value="">Wähle Kategorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <hr />
        <section className="word-grid">
          {/* Source Word */}
          <div className={`word-parent ${moreSource ? "add-more-option" : ""}`}>
            <div
              className={`word-panel ${moreSource ? "add-more-option" : ""}`}
            >
              <div className="panel-title">
                <span></span>
                <strong>Ausgangswort</strong>
              </div>

              {/* source word container */}
              <div className="source_word-contianer">
                <div className="source_word-input">
                  <label htmlFor="source_word">
                    Begriff <span>*</span>
                  </label>
                  <input
                    name="word"
                    value={formData.translations[0].word}
                    onChange={(e) => handleChange(0, e)}
                    placeholder="e.g. Resilience"
                    autoComplete="word"
                    required
                  />
                </div>

                <div className="source_word-lang">
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
                className={`${moreSource ? "" : "source_tip"}`}
              >
                Tipp (Optional)
              </label>
              <input
                type="text"
                name="tip"
                value={formData.translations[0].tip}
                onChange={(e) => handleChange(0, e)}
                placeholder="Stell dir eine Feder vor, die zurückspringt"
                autoComplete="tip"
              />

              <label htmlFor="source_sentence">Beispielsatz (Optional)</label>
              <textarea
                name="sentence"
                value={formData.translations[0].sentence}
                onChange={(e) => handleChange(0, e)}
                placeholder="Ihre Widerstandsfähigkeit nach dem Rückschlag war bewundernswert."
              />
            </div>

            <div className="button-container">
              {!moreSource ? (
                <button
                  className="more-source-button"
                  type="button"
                  onClick={() => setMoreSource((prev) => !prev)}
                >
                  mehr
                </button>
              ) : (
                <button
                  className="more-source-button"
                  type="button"
                  onClick={() => setMoreSource((prev) => !prev)}
                >
                  weniger
                </button>
              )}
            </div>
          </div>

          {/* Target Word */}

          <div className={`word-parent ${moreTarget ? "add-more-option" : ""}`}>
            <div
              className={`word-panel green ${moreTarget ? "add-more-option" : ""}`}
            >
              <div className="panel-title">
                <span></span>
                <strong>Zielwort</strong>
              </div>
              <div className="target_word-contianer">
                <div className="target_word-input">
                  <label htmlFor="target_word">
                    Begriff <span>*</span>
                  </label>
                  <input
                    name="word"
                    value={formData.translations[1].word || ""}
                    onChange={(e) => handleChange(1, e)}
                    placeholder="e.g. Resiliencia"
                    autoComplete="word"
                    required
                  />
                </div>

                <div className="target_word-lang">
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
                className={`${moreTarget ? "" : "target_tip"}`}
              >
                Tipp (Optional)
              </label>
              <input
                type="text"
                name="tip"
                value={formData.translations[1].tip}
                onChange={(e) => handleChange(1, e)}
                placeholder="Stell dir eine Feder vor, die zurückspringt"
                autoComplete="tip"
              />

              <label htmlFor="target_sentence">Beispielsatz (Optional)</label>
              <textarea
                name="sentence"
                value={formData.translations[1].sentence}
                onChange={(e) => handleChange(1, e)}
                placeholder="Ihre Widerstandsfähigkeit nach dem Rückschlag war bewundernswert."
              />
            </div>
            <div className="button-container">
              {!moreTarget ? (
                <button
                  className="more-target-button"
                  type="button"
                  onClick={() => setMoreTarget((prev) => !prev)}
                >
                  mehr
                </button>
              ) : (
                <button
                  className="more-target-button"
                  type="button"
                  onClick={() => setMoreTarget((prev) => !prev)}
                >
                  weniger
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="pro-tip">
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

        <div className="action-buttons">
          <Link
            to="/my-quiz/all-words"
            className="main-quiz-button-cancel cancel-btn"
          >
            {t("BUTTONS.CANCEL")}
          </Link>
          <button type="submit" className="main-quiz-button save-btn">
            {t("BUTTONS.SAVE")}
          </button>
        </div>
      </form>
    </section>
  );
}

function WordPanel({
  badge,
  title,
  label,
  placeholder,
  tipPlaceholder,
  sentencePlaceholder,
  green,
  values,
  onChange,
  wordName,
  tipName,
  sentenceName,
}) {
  return (
    <div className={`word-panel ${green ? "green" : ""}`}>
      <div className="panel-title">
        <span>{badge}</span>
        <strong>{title}</strong>
      </div>

      <label>
        {label} <span>*</span>
      </label>
      <input
        name={wordName}
        value={values[wordName]}
        onChange={onChange}
        placeholder={placeholder}
        required
      />

      <label>Mnemonic Tip (Optional)</label>
      <input
        name={tipName}
        value={values[tipName]}
        onChange={onChange}
        placeholder={tipPlaceholder}
      />

      <label>Beispielsatz (Optional)</label>
      <textarea
        name={sentenceName}
        value={values[sentenceName]}
        onChange={onChange}
        placeholder={sentencePlaceholder}
      />
    </div>
  );
}
