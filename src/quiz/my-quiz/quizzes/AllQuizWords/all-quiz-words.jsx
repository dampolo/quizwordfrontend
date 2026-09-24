import useQuiz from "../../../../context/useQuiz";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import styles from "./all-quiz-words.module.scss";
import quizStyles from "../PlayQuiz/play-quiz.module.scss";
import useDialog from "../../../../context/DialogContext/useDialog";
import BackButton from "../../../../components/BackButton/BackButton";
import PreLoader from "../../../../components/PreLoader/PreLoader";
import { toast } from "react-toastify";

function AllQuizWords() {
  const {
    getQuizWords,
    deleteQuiz,
    getAttemptQuizScore,
    getAttemptDetails,
    loading,
  } = useQuiz();
  const { openDialog } = useDialog();
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [details, setDetails] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [vocabularyDetails, setVocabularyDetails] = useState(false);

  async function deleteCurrentQuiz() {
    try {
      await deleteQuiz(id);
      toast.success(`Quiz "${quiz?.quiz_name}" wurde entfernt!`);
      navigate("/my-quiz/all-quizzes/");
    } catch (error) {
      console.error(error);
    }
  }

  function handleDelete() {
    openDialog({
      title: "Quiz löschen?",
      description: "Diese Aktion kann nicht rückgängig gemacht werden.",
      confirmText: "Löschen",
      cancelText: "Abbrechen",
      onConfirm: deleteCurrentQuiz,
    });
  }

  async function handleAttemptDetails(id) {
    try {
      const data = await getAttemptDetails(id);
      setDetails(data.answers);
      setVocabularyDetails(true);

      setSelectedAttempt(data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [quizData, attemptsData] = await Promise.all([
          getQuizWords(id),
          getAttemptQuizScore(id),
        ]);
        setQuiz(quizData);
        setAttempts(attemptsData);
      } catch (err) {
        console.error(err);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="show-container">
        <PreLoader />
      </div>
    );
  }

  return (
    <div className={styles["vocabulary"]}>
      <BackButton
        to={`/my-quiz/all-quizzes?language=${quiz?.target_language}`}
      />

      <div className={styles["vocabulary__header"]}>
        <div>
          <h1>Quiz: {quiz?.quiz_name}</h1>
          <p>
            Organize and track your learning progress. Manage definitions,
            categories, and review schedules for all your saved expressions.
          </p>
        </div>

        <div className={styles["action-button"]}>
          <Link
            className={`main-quiz-button ${styles["all-quiz-add-btn"]}`}
            to={`/my-quiz/${id}/learn-quiz?language=${quiz?.target_language}`}
          >
            Learn
          </Link>

          <Link
            className={`main-quiz-button ${styles["all-quiz-add-btn"]}`}
            to={`/my-quiz/${id}/play-quiz?language=${quiz?.target_language}`}
          >
            Spiel
          </Link>
          <Link
            className={`main-quiz-button ${styles["all-quiz-add-btn"]}`}
            to={`/my-quiz/${id}/flip-card-quiz?language=${quiz?.target_language}`}
          >
            Karteikarten
          </Link>
        </div>
      </div>

      <div className={styles["word-list-attempt"]}>
        <div className={styles["list-head-attempt"]}>
          <div className={styles["rank"]}>Rang</div>
          <div className={styles["word"]}>Wort & Übersetzung</div>
          <div className={styles["category"]}>Kategorie</div>
          <div className={styles["streak"]}>Serie</div>
          <div className={styles["actions"]}>Aktionen</div>
        </div>

        {quiz?.concepts.map((concept) => (
          <div className={styles["list-row-attempt"]} key={concept.id}>
            <div className={styles["rank"]}>#{concept.translations[1].rank}</div>

            <div className={styles["word"]}>
              <h3>{concept.translations[0].word}</h3>
              <span>»</span>
              <p>{concept.translations[1].word}</p>
            </div>

            <div className={styles["category"]}>
              <span
                className={`${styles["badge"]} ${styles[concept.translations[1].category_name] || ""}`}
              >
                {concept.translations[1].category_name}
              </span>
            </div>

            <div className={styles["streak"]}>
              🔥
              <strong>{concept.translations[1].streak}</strong>
              <span>Days</span>
            </div>

            <Link
              to={`/my-quiz/${concept.id}/edit-word?target-word=${concept.translations[1].id}&language=${concept.translations[1].language}`}
              className={styles["actions"]}
            >
              ✏️
            </Link>
          </div>
        ))}
      </div>

      {/* ATTEMPTS */}
      <div className={styles["attempt-list"]}>
        <div className={styles["list-head-score"]}>
          <div>Punktzahl</div>
          <div>Richtung</div>
          <div>Datum</div>
          <div>Einzelheiten</div>
        </div>

        {attempts.length === 0 ? (
          <p>Du hast bis jetzt keine Quize gemacht.</p>
        ) : (
          attempts.map((attempt) => (
            <div className={styles["list-row-score"]} key={attempt.id}>
              <div className={styles["rank"]}>#{attempt.score}</div>

              <div className={styles["word"]}>
                <span>{attempt.direction}</span>
              </div>

              {/* to={`/my-quiz/${word.id}/edit-word`} */}
              <div>
                {new Date(attempt.finished_at).toLocaleString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </div>
              <button
                onClick={() => handleAttemptDetails(attempt.id)}
                className={styles["actions"]}
              >
                🔍
              </button>
            </div>
          ))
        )}
      </div>

      {/* ATTEMPTS ENDE */}

      <div className={styles["cards"]}>
        <div className={`${styles["card"]} goal`}>
          <h3>Today's Goal</h3>
          <p>Review 20 new words to keep your streak alive.</p>

          <div className={styles["progress"]}>
            <div className={styles["progress-fill"]}></div>
          </div>

          <small>12 / 20 Words • 60%</small>
        </div>

        <div className={`${styles["card"]} ${styles["mastery"]}`}>
          <h3>Mastery Level</h3>
          <p>You've reached B2 fluency level in Vocabulary.</p>
        </div>

        <div className={`${styles["card"]} ${styles["review"]}`}>
          <h3>Flashcard Review</h3>
          <p>Ready to test your memory on recent additions?</p>

          <button>Start Review Session</button>
        </div>
      </div>

      {/* DEATAILS */}
      <section
        className={`${styles["vocabulary-details"]} ${
          vocabularyDetails ? styles["show-vocabulary-details"] : ""
        }`}
      >
        <div className={styles["vocabulary-card"]}>
          <div className={styles["card-header"]}>
            <h3>Vocabulary details</h3>
            {selectedAttempt && (
              <span>
                {new Date(selectedAttempt.started_at).toLocaleString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <span className={styles["badge"]}>{details.length} Words Total</span>
          </div>

          <div className={styles["table"]}>
            <button
              type="button"
              onClick={() => setVocabularyDetails(false)}
              className={quizStyles["quiz-card__cancel"]}
            >
              <img width={25} height={25} src="/assets/xbox.svg" alt="Close" />
            </button>
            {attempts.length === 0 ? (
              <p>Du hast bis jetzt keine Quize gemacht.</p>
            ) : details.length === 0 ? (
              <p>"Klicke auf 🔍, um die Details anzuzeigen."</p>
            ) : (
              details.map((item) => (
                <div
                  key={item.id}
                  className={`${styles["table-row"]} ${!item.is_correct ? styles["wrong"] : ""}`}
                >
                  <div className={styles["status"]}>
                    <span
                      className={
                        `${styles["icon"]} ${item.is_correct ? styles["success"] : styles["error"]}`
                      }
                    >
                      {item.is_correct ? "✓" : "✕"}
                    </span>
                  </div>

                  <div className={styles["column"]}>
                    <span className={styles["label"]}>Wort</span>
                    <h4>{item.correct_answer}</h4>
                  </div>

                  <div className={styles["column"]}>
                    <span className={styles["label"]}>Antwort</span>
                    <p className={!item.is_correct ? styles["incorrect"] : ""}>
                      {item.user_answer}
                    </p>
                  </div>

                  <div className={styles["column"]}>
                    <span className={styles["label"]}>Richtig</span>
                    <p className={styles["correct"]}>{item.correct_answer}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* DETAILS ENDE */}

      <button>
        <img onClick={handleDelete} src="/assets/trash.svg" alt="delete" />
      </button>
    </div>
  );
}

export default AllQuizWords;
