import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./learn-quiz.scss";
import { useEffect, useState } from "react";
import useQuiz from "../../../../context/useQuiz";
import { Link } from "react-router-dom";

function LearnQuiz() {
  const [quiz, setQuiz] = useState(null);
  const { id } = useParams();
  const { getQuizWords } = useQuiz();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") === "true";
  const language = searchParams.get("language");

  function adjustCurrentQuestion() {
    const isLastWord = currentQuestion === quiz.length - 1;
    if (isLastWord) {
      navigate(`/my-quiz/${id}/all-quiz-words`);
      return
    }
    setCurrentQuestion((prev) => prev + 1);
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
      <div className="quiz-card learn-card">
        <button type="button" className="quiz-card__cancel" onClick={cancel}>
          <img width={25} height={25} src="/assets/xbox.svg" alt="Close" />
        </button>
        <div className="quiz-card__header">
          <h1 className="quiz-card__title">
            {quiz?.[currentQuestion].translations[0].word}
          </h1>
        </div>
        <div className="quiz-card__form">
          <span className="quiz-card__line"></span>

          <span className="quiz-card__answer-wrapper">
            {quiz?.[currentQuestion].translations[1].word}
          </span>

          <button
            type="button"
            className="main-quiz-button quiz-button"
            onClick={adjustCurrentQuestion}
          >
            <span>Weiter</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default LearnQuiz;
