import { useEffect, useState } from "react";
import styles from "./all-quizzes.module.scss";
import { Link, useSearchParams } from "react-router-dom";
import useQuiz from "../../../../context/useQuiz";
import PreLoader from "../../../../components/PreLoader/PreLoader";
import useVocabulary from "../../../../context/useVocabulary";
import FormDialog from "../../../../components/FormDialog/FormDialog";
import { toast } from "react-toastify";

function Quizzes() {
  const {
    getFiltredQuizzes,
    quizzes,
    loading,
    getQuizzes,
    putQuiz,
    getQuizWords,
  } = useQuiz();
  const { userLanguages } = useVocabulary();
  const [searchParams, setSearchParams] = useSearchParams();
  const language = searchParams.get("language");
  const active = language ? Number(language) : null;
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");
  const [quizOverview, setQuizOverview] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [loadingWords, setLoadingWords] = useState(false);

  async function getOverview(id) {
    setQuizOverview(true);
    setLoadingWords(true);

    try {
      const quizData = await getQuizWords(id);
      setQuiz(quizData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load quiz overview.");
      setQuiz(null);
    } finally {
      setLoadingWords(false);
    }
  }

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

  function setQuizWords() {
    setQuizOverview(false);
  }

  useEffect(() => {
    if (language) {
      getFiltredQuizzes(language);
    } else {
      getQuizzes();
    }
  }, [language]);

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
    <section className={styles["all-quizzes"]}>
      <header className={styles["topbar"]}>
        <div>
          <h1>Aktive Quizze</h1>
          <p>
            Setze deinen Lernfortschritt fort. Teste dein Wissen mit kürzlich
            hinzugefügten Vokabeln oder konzentriere dich auf deine
            Schwachstellen.
          </p>
        </div>
      </header>

      <ul className={styles["languages-list"]}>
        <li
          className={`${styles["language-single"]} ${active === null ? styles["active"] : ""}`}
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
            key={lang.id}
            className={`${styles["language-single"]} ${active === lang.id ? styles["active"] : ""}`}
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

      {/* Quiz */}
      <div className={styles["category"]}>
        {loading ? (
          <div className="show-container">
            <PreLoader />
          </div>
        ) : quizzes.length === 0 ? (
          <p className={styles["no-quiz"]}>Du hast hier kein Quiz erstellt.</p>
        ) : (
          quizzes.map((quiz) => (
            <article className={styles["vocab-card"]} key={quiz.quiz_id}>
              <h3>{quiz.quiz_name}</h3>
              <button
                type="button"
                className={styles["edit"]}
                onClick={() => {
                  setSelectedQuiz(quiz);
                  openDialog();
                }}
              >
                <img src="/assets/edit.svg" alt="edit" />
              </button>

              <div className={styles["action-button"]}>
                <Link
                  className={styles["action-button__icon"]}
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
                  className={styles["action-button__icon"]}
                  to={`/my-quiz/${quiz.quiz_id}/play-quiz?language=${quiz?.target_language}&redirect=true`}
                >
                  <img
                    width={40}
                    height={40}
                    src="/assets/play-quiz.svg"
                    alt="play"
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => getOverview(quiz.quiz_id)}
                  className={styles["action-button__icon"]}
                >
                  <img
                    width={40}
                    height={40}
                    src="/assets/look-quiz.svg"
                    alt="look"
                  />
                </button>

                {/* Flip Card */}
                <Link
                  className={styles["action-button__icon"]}
                  to={`/my-quiz/${quiz.quiz_id}/flip-card-quiz?language=${quiz?.target_language}&redirect=true`}
                >
                  <img
                    width={40}
                    height={40}
                    src="/assets/flip-card.svg"
                    alt="look"
                  />
                </Link>
                {/* Flip Card end*/}
              </div>

              <div className={styles["vocab-card__footer"]}>
                <Link
                  to={`/my-quiz/${quiz.quiz_id}/all-quiz-words?language=${quiz?.target_language}`}
                  className={styles["vocab-card__meta"]}
                >
                  <span>▦</span>
                  <strong>{quiz.concepts_count} Words</strong>
                </Link>

                <div className={styles["vocab-card__updated"]}>
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
      <section
        className={`${styles["quiz-overview"]} ${quizOverview ? styles["show-quiz-overview"] : ""}`}
      >
        <button
          type="button"
          onClick={setQuizWords}
          className={styles["quiz-overview__close"]}
        >
          <img width={25} height={25} src="/assets/xbox.svg" alt="Close" />
        </button>
        <div className={styles["quiz-overview__list"]}>
          <div className={styles["quiz-overview__head"]}>
            <div className={styles["quiz-overview__word"]}>
              Wort & Übersetzung
            </div>
            <div className={styles["quiz-overview__actions"]}>Aktionen</div>
          </div>

          {loadingWords ? (
            <div className="show-container">
              <PreLoader />
            </div>
          ) : (
            quiz?.concepts.map((concept) => (
              <div className={styles["quiz-overview__row"]} key={concept.id}>
                <div className={styles["quiz-overview__word"]}>
                  <h3>{concept.translations[0].word}</h3>
                  <span>»</span>
                  <p>{concept.translations[1].word}</p>
                </div>

                <div className={styles["quiz-overview__actions"]}>
                  <Link
                    to={`/my-quiz/${concept.id}/edit-word?target-word=${concept.translations[1].id}&language=${concept.translations[1].language}`}
                  >
                    <img src="/assets/edit.svg" alt="edit" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </section>
  );
}

export default Quizzes;
