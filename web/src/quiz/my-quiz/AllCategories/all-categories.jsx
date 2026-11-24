import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import useVocabulary from "../../../context/vocabulary/useVocabulary";
import { Link, useSearchParams } from "react-router-dom";
import PreLoader from "../../../components/PreLoader/PreLoader";

import styles from "./all-categories.module.scss";
import PageTitle from "../../../components/PageTitle/PageTitle";
import Tooltip from '@mui/material/Tooltip';


export default function AllCategories() {
  const { t } = useTranslation();
  const {
    categories,
    userLanguages,
    loadingUserLanguages,
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
      <PageTitle title={t("NAVBAR.CATEGORIES")} />
      <header className={styles["topbar"]}>
        <div>
          <h1>{t("VOCABULARY_CATEGORIES.TITLE")}</h1>
          <p>
            {t("VOCABULARY_CATEGORIES.DESCRIPTION")}
          </p>
        </div>

        <Link
          className={`main-quiz-button ${styles["add-new-category-button"]}`}
          to="/my-quiz/add-new-category"
        >
          {t("VOCABULARY_CATEGORIES.ADD_CATEGORY")}
        </Link>
      </header>

      <ul className={styles["languages-list"]}>
        <li
          className={`${styles["language-single"]} ${active === null ? styles["active"] : ""}`}
        >
          <button
            className={styles["language-button"]}
            onClick={() => selectLanguage(null)}
          >
            {t("VOCABULARY_CATEGORIES.ALL")}
          </button>
        </li>

        {loadingUserLanguages ? (
          <PreLoader label={t("LOGIN.LOADING")} />
        ) : (
          userLanguages.map((lang) => (
            <li
              className={`${styles["language-single"]} ${active === lang.id ? styles["active"] : ""}`}
              key={lang.id}
            >
              <button
                className={styles["language-button"]}
                onClick={() => selectLanguage(lang.id)}
              >
                {lang.language_name}
              </button>
            </li>
          ))
        )}
      </ul>
      <section className={styles["category"]}>
        {loading ? (
          <div className="show-container">
            <PreLoader label={t("LOGIN.LOADING")} />
          </div>
        ) : categories.length === 0 ? (
          <p className={styles["no-category"]}>
            {t("VOCABULARY_CATEGORIES.EMPTY")}
          </p>
        ) : (
          categories.map((cat) => (
            <article
              className={`${styles["card"]} ${cat.wide ? styles["wide"] : ""}`}
              key={cat.category_id}
            >
              <div className={styles["card-actions"]}>
                <h3>{cat.category_name}</h3>
                <Tooltip title={t("VOCABULARY_CATEGORIES.EDIT_TITLE")} placement="top" arrow>
                  <Link
                    className={styles["edit"]}
                    to={`/my-quiz/all-categories/${cat.category_id}/edit-category?language=${language}`}
                  >
                    <img src="/assets/edit.svg" alt={t("VOCABULARY_CATEGORIES.EDIT_TITLE")} />
                  </Link>
                </Tooltip>
              </div>

              <div className={styles["card__footer"]}>
                <Link
                  to={`/my-quiz/${cat.category_id}/all-category-words?language=${cat.language_id}`}
                  className={styles["card__meta"]}
                >
                  <span>▦</span>
                  <strong>{t("VOCABULARY_CATEGORIES.WORD_COUNT", { count: cat.concepts_count ?? 0 })}</strong>
                </Link>
                <span>{cat.language_name}</span>
              </div>
            </article>
          ))
        )}

        <Link className={styles["add-card"]} to="/my-quiz/add-new-category">
          <span>⊕</span>
          <strong>{t("ADD_NEW_CATEGORY_BUTTON.TITLE_2")}</strong>
          <small>{t("ADD_NEW_CATEGORY_BUTTON.DESCRIPTION")}</small>
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
