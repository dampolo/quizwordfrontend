import { useEffect } from "react";
import useVocabulary from "../../context/useVocabulary";
import "./all-categories.scss";
import { Link, useSearchParams } from "react-router-dom";
import PreLoader from "../../components/PreLoader/PreLoader";

export default function VocabularyCategories() {
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

  if (loading) {
    return (
      <div className="show-container ">
        <PreLoader />
      </div>
    );
  }

  return (
    <section className="vocab-page">
      <header className="topbar">
        <div>
          <h1>Vokabelkategorien</h1>
          <p>
            Organisiere deinen Lernfortschritt nach Thema und
            Schwierigkeitsgrad.
          </p>
        </div>

        <Link
          className="main-quiz-button add-new-category-button"
          to="/my-quiz/add-new-category"
        >
          + Kategorie
        </Link>
      </header>

      <ul className="languages-list">
        <li
          className={
            active === null ? "language-single active" : "language-single"
          }
        >
          <button
            className="language-button"
            onClick={() => selectLanguage(null)}
          >
            Alle
          </button>
        </li>

        {userLanguages.map((lang) => (
          <li
            className={
              active === lang.id ? "language-single active" : "language-single"
            }
            key={lang.id}
          >
            <button
              className="language-button"
              onClick={() => selectLanguage(lang.id)}
            >
              {lang.language_name}
            </button>
          </li>
        ))}
      </ul>
      <section className="category">
        {categories.length === 0 ? (
          <p className="no-category">Du hast hier keine Kategorie erstellt.</p>
        ) : (
          categories.map((cat) => (
            <article className={`card ${cat.wide ? "wide" : ""}`} key={cat.id}>
              <div className="card-actions">
                <h3>{cat.category_name}</h3>
                <Link className="edit"
                  to={`/my-quiz/vocabulary-categories/${cat.id}/edit-category?language=${language}`}
                >
                  <img src="/assets/edit.svg" alt="edit" />
                </Link>
              </div>

              <span>{cat.language_name}</span>
            </article>
          ))
        )}

        <Link className="add-card" to="/my-quiz/add-new-category">
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
    <div className="stat">
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
    <div className="activity-row">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{meta}</small>
      </div>
      <b>{xp}</b>
    </div>
  );
}
