import { useEffect } from "react";
import useVocabulary from "../../../context/useVocabulary";
import { Link, useSearchParams } from "react-router-dom";
import PreLoader from "../../../components/PreLoader/PreLoader";

import styles from "./all-categories.module.scss";

export default function AllCategories() {
  const {
    categories,
    userLanguages,
    loading,
    getFiltredCategories,
    getCategories,
  } = useVocabulary();
  const [searchParams, setSearchParams] = useSearchParams();
  const language = searchParams.get("language");
  const active = language ? Number(language) : null;

  function selectLanguage(languageId) {
    if (languageId === null) {
      setSearchParams({});
    } else {
      setSearchParams({ language: languageId });
    }
  }

  useEffect(() => {
    if (language === null) {
      getCategories();
    } else {
      getFiltredCategories(language);
    }
  }, [language]);


  return (
    <section className={styles["vocab-page"]}>
      <header className={styles["topbar"]}>
        <div>
          <h1>Vokabelkategorien</h1>
          <p>
            Organisiere deinen Lernfortschritt nach Thema und
            Schwierigkeitsgrad.
          </p>
        </div>

        <Link
          className={`main-quiz-button ${styles["add-new-category-button"]}`}
          to="/my-quiz/add-new-category"
        >
          + Kategorie
        </Link>
      </header>

      <ul className={styles["languages-list"]}>
        <li
          className={
            `${styles["language-single"]} ${active === null ? styles["active"] : ""}`
          }
        >
          <button
            className={styles["language-button"]}
            onClick={() => selectLanguage(null)}
          >
            Alle
          </button>
        </li>

        {userLanguages.map((lang) => (
          <li
            className={
              `${styles["language-single"]} ${active === lang.id ? styles["active"] : ""}`
            }
            key={lang.id}
          >
            <button
              className={styles["language-button"]}
              onClick={() => selectLanguage(lang.id)}
            >
              {lang.language_name}
            </button>
          </li>
        ))}
      </ul>
      <section className={styles["category"]}>
        {loading ? (
          <div className="show-container">
            <PreLoader />
          </div>
        ) : categories.length === 0 ? (
          <p className={styles["no-category"]}>Du hast hier keine Kategorie erstellt.</p>
        ) : (
          categories.map((cat) => (
            <article className={`${styles["card"]} ${cat.wide ? styles["wide"] : ""}`} key={cat.id}>
              <div className={styles["card-actions"]}>
                <h3>{cat.category_name}</h3>
                <Link
                  className={styles["edit"]}
                  to={`/my-quiz/all-categories/${cat.id}/edit-category?language=${language}`}
                >
                  <img src="/assets/edit.svg" alt="edit" />
                </Link>
              </div>

              <span>{cat.language_name}</span>
            </article>
          ))
        )}

        <Link className={styles["add-card"]} to="/my-quiz/add-new-category">
          <span>⊕</span>
          <strong>Neue Kategorie hinzufügen</strong>
          <small>Erstelle eine individuelle Lernliste.</small>
        </Link>
      </section>
    </section>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className={styles["stat"]}>
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Activity({ icon, title, meta, xp }) {
  return (
    <div className={styles["activity-row"]}>
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{meta}</small>
      </div>
      <b>{xp}</b>
    </div>
  );
}
