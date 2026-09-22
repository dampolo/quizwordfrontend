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

  function toggleFlipped() {
    setIsFlipped((prev) => !prev);
  }

  const [pendingDirection, setPendingDirection] = useState(null);

  function adjustCurrentQuestion(direction) {
    if (isFlipped) {
      // Flip to the front first and remember the direction.
      setPendingDirection(direction);
      setIsFlipped(false);
      return;
    }

    // The card is already showing its front.
    if (direction === "previous") {
      showPreviousQuestion();
    } else {
      showNextQuestion();
    }
  }

  function showNextQuestion() {
    const isLastWord = currentQuestion === quiz.length - 1;

    if (isLastWord) {
      setCurrentQuestion(0);
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  }

  function showPreviousQuestion() {
    const isFirstWord = currentQuestion === 0;

    if (isFirstWord) {
      setCurrentQuestion(quiz.length - 1);
    } else {
      setCurrentQuestion((prev) => prev - 1);
    }
  }

  // When the card has finished flipping,
  // check whether we are supposed to change the question.
  // If yes, go to the next question.
  function handleTransitionEnd(event) {
    if (event.propertyName !== "transform" || !pendingDirection) {
      return;
    }

    if (pendingDirection === "previous") {
      showPreviousQuestion();
    } else {
      showNextQuestion();
    }

    setPendingDirection(null);
  }

  useEffect(() => {
    async function loadData() {
      const isFlipcard = true;
      try {
        const quizData = await getQuizWords(id, isFlipcard);
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

  return (
    <section className="play-quiz">
      {/* Front */}
      <div
        className={`flip-card-inner ${isFlipped ? "flipped" : ""}`}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="flip-card-front">
          <span className="languages">
            {quiz?.[currentQuestion].translations[0].language_name} →{" "}
            {quiz?.[currentQuestion].translations[1].language_name}
          </span>

          <button type="button" className="quiz-card__cancel" onClick={cancel}>
            <img width={25} height={25} src="/assets/xbox.svg" alt="Close" />
          </button>

          <div className="quiz-card__header">
            <h1 className="quiz-card__title-learn flip-title">
              {quiz?.[currentQuestion].translations[0].word}
            </h1>
          </div>

          <div className="quiz-card__form">
            {/* Buttons */}
            <div className="buttons-flip">
              <button
                type="button"
                className="flip-card-button"
                onClick={() => adjustCurrentQuestion("previous")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={32}
                  height={32}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffff"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <button
                type="button"
                className="flip-card-button"
                onClick={() => adjustCurrentQuestion("next")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={32}
                  height={32}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffff"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
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
          <span className="languages">
            {quiz?.[currentQuestion].translations[1].language_name}
          </span>

          <button type="button" className="quiz-card__cancel" onClick={cancel}>
            <img width={25} height={25} src="/assets/xbox.svg" alt="Close" />
          </button>

          {/* translation */}
          <div className="quiz-card__form">
            <span className="quiz-card__line"></span>

            <h1 className="quiz-card__answer-wrapper-learn flip-title">
              {quiz?.[currentQuestion].translations[1].word}
            </h1>
          </div>

          {/* Buttons */}
          <div className="buttons-flip">
            <button
              type="button"
              className="flip-card-button"
              onClick={() => adjustCurrentQuestion("previous")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={32}
                height={32}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <button
              type="button"
              className="flip-card-button"
              onClick={() => adjustCurrentQuestion("next")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={32}
                height={32}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
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
        {/* Back ENDE */}
      </div>
    </section>
  );
}

export default FlipCardQuiz;
