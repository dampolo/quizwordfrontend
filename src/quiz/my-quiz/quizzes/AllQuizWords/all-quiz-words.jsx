import * as React from "react";
import "./../../all-words.scss";
import useQuiz from "../../../../context/useQuiz";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import "./all-quiz-words.scss";
import useDialog from "../../../../context/DialogContext/useDialgo";
import BackButton from "../../../../components/BackButton/BackButton";
import PreLoader from "../../../../components/PreLoader/PreLoader";

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

  async function deleteCurrentQuiz() {
    try {
      await deleteQuiz(id);
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
      console.log(data.answers);
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

        console.log("quizData: ", quizData);

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
    <div className="vocabulary">
      <BackButton to="/my-quiz/all-quizzes/" />

      <div className="vocabulary__header">
        <div>
          <h1>Quiz: {quiz?.quiz_name}</h1>
          <p>
            Organize and track your learning progress. Manage definitions,
            categories, and review schedules for all your saved expressions.
          </p>
        </div>

        <Link
          className="main-quiz-button add-btn"
          
          to={`/my-quiz/${id}/learn-quiz?language=${quiz?.target_language}`}
        >
          Lernen
        </Link>

        <Link
          className="main-quiz-button add-btn"
          to={`/my-quiz/${id}/play-quiz?language=${quiz?.target_language}`}
        >
          Spiel
        </Link>
      </div>

      <div className="word-list-attempt">
        <div className="list-head-attempt">
          <div className="rank">Rang</div>
          <div className="word">Wort & Übersetzung</div>
          <div className="category">Kategorie</div>
          <div className="streak">Serie</div>
          <div className="actions">Aktionen</div>
        </div>

        {quiz?.concepts.map((concept) => (
          <div className="list-row-attempt" key={concept.id}>
            <div className="rank">#{concept.translations[1].rank}</div>

            <div className="word">
              <h3>{concept.translations[0].word}</h3>
              <span>»</span>
              <p>{concept.translations[1].word}</p>
            </div>

            <div className="category">
              <span
                className={`badge ${concept.translations[1].category_name}`}
              >
                {concept.translations[1].category_name}
              </span>
            </div>

            <div className="streak">
              🔥
              <strong>{concept.translations[1].streak}</strong>
              <span>Days</span>
            </div>

            <button to={`/my-quiz/${concept.id}/edit-word`} className="actions">
              ✏️
            </button>
          </div>
        ))}
      </div>

      {/* ATTEMPTS */}
      <div className="attempt-list">
        <div className="list-head-score">
          <div>Punktzahl</div>
          <div>Richtung</div>
          <div>Datum</div>
          <div>Einzelheiten</div>
        </div>

        {attempts.length === 0 ? (
          <p>Du hast bis jetzt keine Quize gemacht.</p>
        ) : (
          attempts.map((attempt) => (
            <div className="list-row-score" key={attempt.id}>
              <div className="rank">#{attempt.score}</div>

              <div className="word">
                <span>{attempt.direction}</span>
              </div>

              {/* to={`/my-quiz/${word.id}/edit-word`} */}
              <div>
                {new Date(attempt.finished_at).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </div>
              <button
                onClick={() => handleAttemptDetails(attempt.id)}
                className="actions"
              >
                🔍
              </button>
            </div>
          ))
        )}
      </div>

      {/* ATTEMPTS ENDE */}

      <div className="cards">
        <div className="card goal">
          <h3>Today's Goal</h3>
          <p>Review 20 new words to keep your streak alive.</p>

          <div className="progress">
            <div className="progress-fill"></div>
          </div>

          <small>12 / 20 Words • 60%</small>
        </div>

        <div className="card mastery">
          <h3>Mastery Level</h3>
          <p>You've reached B2 fluency level in Vocabulary.</p>
        </div>

        <div className="card review">
          <h3>Flashcard Review</h3>
          <p>Ready to test your memory on recent additions?</p>

          <button>Start Review Session</button>
        </div>
      </div>

      {/* DEATAILS */}
      <div className="vocabulary-card">
        <div className="card-header">
          <h3>Vocabulary details</h3>
          <span className="badge">{details.length} Words Total</span>
        </div>

        <div className="table">
          {attempts.length === 0 ? (
            <p>Du hast bis jetzt keine Quize gemacht.</p>
          ) : details.length === 0 ? (
            <p>"Klicke auf 🔍, um die Details anzuzeigen."</p>
          ) : (
            details.map((item) => (
              <div
                key={item.id}
                className={`table-row ${!item.is_correct ? "wrong" : ""}`}
              >
                <div className="status">
                  <span
                    className={item.is_correct ? "icon success" : "icon error"}
                  >
                    {item.is_correct ? "✓" : "✕"}
                  </span>
                </div>

                <div className="column">
                  <span className="label">SOURCE WORD</span>
                  <h4>{item.correct_answer}</h4>
                </div>

                <div className="column">
                  <span className="label">YOUR ANSWER</span>
                  <p className={!item.is_correct ? "incorrect" : ""}>
                    {item.user_answer}
                  </p>
                </div>

                <div className="column">
                  <span className="label">CORRECT MEANING</span>
                  <p className="correct">{item.correct_answer}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* DETAILS ENDE */}

      <button>
        <img onClick={handleDelete} src="/assets/trash.svg" alt="delete" />
      </button>
    </div>
  );
}

export default AllQuizWords;
