import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useQuiz from "../../../../context/useQuiz";
import { Link } from "react-router-dom";
import styles from "./play-quiz.module.scss";

function PlayQuiz() {
  const { getQuizWords, postQuizAnswers } = useQuiz();
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hint, setHint] = useState(false);
  const redirect = searchParams.get("redirect") === "true";
  const language = searchParams.get("language");

  const [formData, setFormData] = useState({
    answer: "",
  });

  const [answers, setAnswers] = useState([]);

  function handleAnswer(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  async function adjustCurrentQuestion() {
    setHint(false);
    const updatedAnswers = [
      ...answers,
      {
        id: quiz[currentQuestion].id,
        answer: formData.answer,
      },
    ];

    setAnswers(updatedAnswers);

    const isLastQuestion = currentQuestion === quiz.length - 1;

    if (isLastQuestion) {
      const payload = {
        direction: "FORWARD",
        answers: updatedAnswers,
      };

      try {
        const result = await postQuizAnswers(id, payload);

        navigate(`/my-quiz/${id}/quiz-results`, {
          state: result,
        });
      } catch (error) {
        console.error("Quiz could not be submitted:", error);
      }
      return;
    }

    setCurrentQuestion(currentQuestion + 1);
    setFormData({
      answer: "",
    });
  }

  useEffect(() => {
    async function loadData() {
      try {
        const quizData = await getQuizWords(id);
        setQuiz(quizData.concepts);
      } catch (error) {
        console.error(error);
      }
    }
    loadData();
  }, [id]);

    function cancel() {
    if (redirect) {
      navigate(`/my-quiz/all-quizzes?language=${language}`);
    } else {
      navigate(`/my-quiz/${id}/all-quiz-words`);
    }
  }

  return (
    <section className="play-quiz">
      <div className={styles["quiz-card"]}>
        <button type="button" onClick={cancel}
          className={styles["quiz-card__cancel"]}
          to={`/my-quiz/${id}/all-quiz-words`}
        >
          <img width={25} height={25} src="/assets/xbox.svg" alt="Close" />
        </button>
        <div className={styles["quiz-card__header"]}>
          <h1 className={styles["quiz-card__title"]}>
            {quiz?.[currentQuestion].translations[0].word}
          </h1>
        </div>

        <p className={styles["quiz-card__subtitle"]}>Übersetzte das Word:</p>

        <div className={styles["hint-container"]}>
          <div className={`${styles["hide-hint"]} ${hint ? styles["show-hint"] : ""}`}>
            {quiz?.[currentQuestion].translations[1].tip === "" ? (
              <p className={styles["hint-text"]}>Du hast kein Tipp hinterlegt.</p>
            ) : (
              <p className={styles["hint-text"]}>
                {quiz?.[currentQuestion].translations[1].tip}
              </p>
            )}
          </div>
        </div>

        <form className={styles["quiz-card__form"]}>
          <label htmlFor="translation" className={styles["quiz-card__label"]}>
            Your Translation
          </label>

          <div className={styles["quiz-card__input-wrapper"]}>
            <input
              name="answer"
              value={formData.answer}
              onChange={handleAnswer}
              type="text"
              placeholder="Type your answer here..."
              className={styles["quiz-card__input"]}
              autoComplete="off"
            />
            <button
              type="button"
              className={styles["quiz-card__help"]}
              aria-label="Help"
              onClick={() => setHint((prev) => !prev)}
              title="Klick um hinweis zu sehen"
            >
              ?
            </button>
          </div>
          <button
            type="button"
            className={`main-quiz-button ${styles["play-button"]}`}
            onClick={adjustCurrentQuestion}
            disabled={formData.answer.length <= 2}
          >
            <span>Weiter</span>
          </button>
        </form>
      </div>
    </section>
  );
}

export default PlayQuiz;
