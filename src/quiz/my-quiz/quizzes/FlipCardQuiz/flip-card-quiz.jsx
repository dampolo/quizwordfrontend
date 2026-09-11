import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./flip-card-quiz.scss";
import { useEffect, useState } from "react";
import useQuiz from "../../../../context/useQuiz";

function FlipCardQuiz() {
  const [quiz, setQuiz] = useState(null);
  const { id } = useParams();
  const { getQuizWords } = useQuiz();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") === "true";
  const language = searchParams.get("language");
  const [isFlipped, setIsFlipped] = useState(false);
  // You can learn in the infinity loop.
  // I leave the code commented out and wait for user feedback.
  function adjustCurrentQuestion() {
    const isLastWord = currentQuestion === quiz.length - 1;
    if (isLastWord && redirect) {
      setCurrentQuestion(0);
      // navigate(`/my-quiz/all-quizzes?language=${language}`);
      return;
    } else if (isLastWord) {
      setCurrentQuestion(0);
      // navigate(`/my-quiz/${id}/all-quiz-words?language=${language}`);
      return;
    }
    setIsFlipped(false)
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
      navigate(`/my-quiz/${id}/all-quiz-words?language=${language}`);
    }
  }

  function toggleFlipped() {
    setIsFlipped((prev) => !prev)
  }

  return (
    <section className="play-quiz">
      {/* Front */}
      <div className={`flip-card-inner ${isFlipped ? "flipped" : ""}`}>
        <div className="flip-card-front">
          <button type="button" className="quiz-card__cancel" onClick={cancel}>
            <img width={25} height={25} src="/assets/xbox.svg" alt="Close" />
          </button>

          <div className="quiz-card__header">
            <h1 className="quiz-card__title-learn">
              {quiz?.[currentQuestion].translations[0].word}
            </h1>
          </div>

          <div className="quiz-card__form">
            {/* Buttons */}
            <div className="buttons-flip">
              <button
                type="button"
                className="main-quiz-button quiz-button"
                onClick={adjustCurrentQuestion}
              >
                <span>Weiter</span>
              </button>

              <button
                type="button"
                className="turn-around"
                onClick={toggleFlipped}
              >
                <img
                  width={48}
                  height={48}
                  src="/assets/turn-around.svg"
                  alt="turn around"
                />
              </button>
            </div>
            {/* Buttons ENDE */}
          </div>
        </div>
        {/* Front ENDE*/}

        {/* Back */}
        <div className="flip-card-back">
          <button type="button" className="quiz-card__cancel" onClick={cancel}>
            <img width={25} height={25} src="/assets/xbox.svg" alt="Close" />
          </button>

          <div className="quiz-card__form">
            <span className="quiz-card__line"></span>

            <span className="quiz-card__answer-wrapper-learn">
              {quiz?.[currentQuestion].translations[1].word}
            </span>

            {/* Buttons */}
            <div className="buttons-flip">
              <button
                type="button"
                className="main-quiz-button quiz-button"
                onClick={adjustCurrentQuestion}
              >
                <span>Weiter</span>
              </button>

              <button
                type="button"
                className="turn-around"
                onClick={toggleFlipped}
              >
                <img
                  width={48}
                  height={48}
                  src="/assets/turn-around.svg"
                  alt="turn around"
                />
              </button>
            </div>
            {/* Buttons ENDE */}
          </div>
        </div>
        {/* Back ENDE */}
      </div>
    </section>
  );
}

export default FlipCardQuiz;
