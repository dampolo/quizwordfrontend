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
  const [changeQuestion, setChangeQuestion] = useState(false);

  function toggleFlipped() {
    setIsFlipped((prev) => !prev);
  }

  function adjustCurrentQuestion() {
    if (isFlipped) {
      // Back side → flip to front first.
      setChangeQuestion(true);
      setIsFlipped(false);
    } else {
      // Already front → no transition will happen.
      changeCurrentQuestion();
    }
  }

  function changeCurrentQuestion() {
    const isLastWord = currentQuestion === quiz.length - 1;

    if (isLastWord) {
      setCurrentQuestion(0);
      return;
    }

    setCurrentQuestion((prev) => prev + 1);
  }

  function handleTransitionEnd(event) {
    if (event.propertyName !== "transform") return;
    if (!changeQuestion) return;

    setChangeQuestion(false);

    const isLastWord = currentQuestion === quiz.length - 1;

    if (isLastWord) {
      setCurrentQuestion(0);
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
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

  return (
    <section className="play-quiz">
      {/* Front */}
      <div
        className={`flip-card-inner ${isFlipped ? "flipped" : ""}`}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="flip-card-front">
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
        {/* Back ENDE */}
      </div>
    </section>
  );
}

export default FlipCardQuiz;
