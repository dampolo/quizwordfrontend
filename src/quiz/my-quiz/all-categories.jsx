import { useEffect } from "react";
import useVocabulary from "../../context/useVocabulary";
import "./all-categories.scss";
import { Link, useSearchParams } from "react-router-dom";
import  PreLoader  from "../../components/PreLoader/PreLoader" 

export default function VocabularyCategories() {
  const { categories, userLanguages, loading, getFiltredCategories } =
    useVocabulary();
  const [searchParams, setSearchParams] = useSearchParams();
  const language = searchParams.get("language");
  const active = language ? Number(language) : null;

  useEffect(() => {
    if(language !== null) {
      getFiltredCategories(language);

    } else {
      getFiltredCategories(userLanguages[0].id);
      
    }
  }, [language]);


  function selectLanguage(languageId) {
    setSearchParams({ language: languageId });
  }


    if (loading) {
      return (
        <div className="show-container ">
        <PreLoader />
        </div>
      )
    }

  return (
    <section className="vocab-page">
      <header className="topbar">
        <div>
          <h1>Vokabelkategorien</h1>
          <p>Organisiere deinen Lernfortschritt nach Thema und Schwierigkeitsgrad.</p>
        </div>

        <Link
          className="main-quiz-button add-new-category-button"
          to="/my-quiz/add-new-category"
        >
          + Kategorie
        </Link>
      </header>

      <ul className="languages-list">
          {userLanguages
            .filter((lang) => lang.language_name === "Without")
            .map((lang) => (
              <li
                className={
                  active === lang.id
                    ? "language-single active"
                    : "language-single"
                }
                key={lang.id}
              >
                <button
                  className="language-button"
                  onClick={() => selectLanguage(lang.id)}
                >
                  Ohne
                </button>
              </li>
            ))}

          {userLanguages
            .filter((lang) => lang.language_name !== "Without")
            .map((lang) => (
              <li
                className={
                  active === lang.id
                    ? "language-single active"
                    : "language-single"
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
        {categories.map((cat) => (
          <article className={`card ${cat.wide ? "wide" : ""}`} key={cat.id}>
            <div className="card-actions">
              <Link to={`/my-quiz/${cat.id}/edit-category`}>
                <img src="/assets/edit.svg" alt="edit" />
              </Link>
              <button>
                <img src="/assets/trash.svg" alt="delete" />
              </button>
            </div>

            <h3>{cat.category_name}</h3>
          </article>
        ))}

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
