import { useEffect } from "react";
import "./all-quizzes.scss";
import { Link, useSearchParams } from "react-router-dom";
import useQuiz from "../../../../context/useQuiz";
import PreLoader from "../../../../components/PreLoader/PreLoader";
import useVocabulary from "../../../../context/useVocabulary";

function Quizzes() {
  const { getFiltredQuizzes, quizzes, getQuizzes } = useQuiz();
  const { userLanguages } = useVocabulary();
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
    if (language) {
      getFiltredQuizzes(language);
    } else {
      getQuizzes();
    }
  }, [language]);

  if (!quizzes) {
    return (
      <div className="show-container">
        <PreLoader />
      </div>
    );
  }

  return (
    <section className="vocab-page">
      <header className="topbar">
        <div>
          <h1>Aktive Quizze</h1>
          <p>
            Setze deinen Lernfortschritt fort. Teste dein Wissen mit kürzlich
            hinzugefügten Vokabeln oder konzentriere dich auf deine
            Schwachstellen.
          </p>
        </div>

        {/* <Link
          className="main-quiz-button add-new-category-button"
          to="/my-quiz/add-new-quiz"
        >
          + Add New Quiz
        </Link> */}
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
            key={lang.id}
            className={
              active === lang.id ? "language-single active" : "language-single"
            }
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

      {/* Quiz */}
      <div className="category">
        {quizzes.map((quiz) => (
          <article className="vocab-card" key={quiz.quiz_id}>
            <h3>{quiz.quiz_name}</h3>

            <div className="vocab-card__footer">
              <Link
                to={`/my-quiz/${quiz.quiz_id}/all-quiz-words`}
                className="vocab-card__meta"
              >
                <span>▦</span>
                <strong>{quiz.concepts_count} Words</strong>
              </Link>

              <div className="vocab-card__updated">
                <span>Aktualisiert</span>
                <strong>
                  {new Date(quiz.updated_at).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </strong>
              </div>
            </div>
          </article>
        ))}
        {/* Quiz END */}

        {/* <Link className="add-card" to="/my-quiz/add-new-quiz">
          <span>⊕</span>
          <strong>Create Custom Quiz</strong>
          <small>
            Hand-pick words from your library to focus your study session
          </small>
        </Link> */}
      </div>
    </section>
  );
}

export default Quizzes;
