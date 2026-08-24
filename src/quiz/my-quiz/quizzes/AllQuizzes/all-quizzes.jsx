import { useEffect, useState } from "react";
import "./all-quizzes.scss";
import { Link, useSearchParams } from "react-router-dom";
import useQuiz from "../../../../context/useQuiz";
import PreLoader from "../../../../components/PreLoader/PreLoader";
import useVocabulary from "../../../../context/useVocabulary";
import FormDialog from "../../../../components/FormDialog/FormDialog";
import { toast } from "react-toastify";

function Quizzes() {
  const { getFiltredQuizzes, quizzes, getQuizzes, putQuiz } = useQuiz();
  const { userLanguages } = useVocabulary();
  const [searchParams, setSearchParams] = useSearchParams();
  const language = searchParams.get("language");
  const active = language ? Number(language) : null;
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");

  function selectLanguage(languageId) {
    if (languageId === null) {
      setSearchParams({});
    } else {
      setSearchParams({ language: languageId });
    }
  }

  function openDialog() {
    setDialogTitle("Edit Quiz");
    setDialogDescription("Du kannst Name des Quizzes ändern: ");
    setDialogOpen(true);
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

  async function handleEditQuiz(quizName) {
    const payload = {
      quiz_name: quizName,
    };

    try {
      await putQuiz(payload, selectedQuiz?.quiz_id);
      toast.success(`Quiz "${quizName}" wurde geändert!`);
      setDialogOpen(false);
      getFiltredQuizzes(language);
    } catch (error) {
      const message = error.response?.detail[0] || "Error";
      setMessage(message);
      toast.error(message);
    }
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
        {quizzes.length === 0 ? (
          <p className="no-quiz">Du hast hier kein Quiz erstellt.</p>
        ) : (
          quizzes.map((quiz) => (
            <article className="vocab-card" key={quiz.quiz_id}>
              <h3>{quiz.quiz_name}</h3>
              <button
                type="button"
                className="edit"
                onClick={() => {
                  setSelectedQuiz(quiz);
                  openDialog();
                }}
              >
                <img src="/assets/edit.svg" alt="edit" />
              </button>

              <div className="action-button">
                <Link
                  to={`/my-quiz/${quiz.quiz_id}/learn-quiz?language=${quiz?.target_language}&redirect=true`}
                >
                  <img
                    width={40}
                    height={40}
                    src="/assets/learn-quiz.svg"
                    alt="learn"
                  />
                </Link>
                <Link
                  to={`/my-quiz/${quiz.quiz_id}/play-quiz?language=${quiz?.target_language}&redirect=true`}
                >
                  <img
                    width={40}
                    height={40}
                    src="/assets/play-quiz.svg"
                    alt="play"
                  />
                </Link>

                <Link to={`/my-quiz/${quiz.quiz_id}/all-quiz-words?language=${quiz?.target_language}`}>
                  <img
                    width={40}
                    height={40}
                    src="/assets/look-quiz.svg"
                    alt="look"
                  />
                </Link>
              </div>

              <div className="vocab-card__footer">
                <Link
                  to={`/my-quiz/${quiz.quiz_id}/all-quiz-words?language=${quiz?.target_language}`}
                  className="vocab-card__meta"
                >
                  <span>▦</span>
                  <strong>{quiz.concepts_count} Words</strong>
                </Link>

                <div className="vocab-card__updated">
                  <span>Erstellt:</span>
                  <strong>
                    {new Date(quiz.created_at).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </strong>
                </div>
              </div>
            </article>
          ))
        )}

        {/* Quiz END */}

        {/* <Link className="add-card" to="/my-quiz/add-new-quiz">
          <span>⊕</span>
          <strong>Create Custom Quiz</strong>
          <small>
            Hand-pick words from your library to focus your study session
          </small>
        </Link> */}
      </div>
      <FormDialog
        quizName={selectedQuiz?.quiz_name}
        dialogTitle={dialogTitle}
        dialogDescription={dialogDescription}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        message={message}
        onSubmit={handleEditQuiz}
      />
    </section>
  );
}

export default Quizzes;
