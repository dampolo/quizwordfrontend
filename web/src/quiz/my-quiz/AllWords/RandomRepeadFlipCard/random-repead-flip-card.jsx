import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import useVocabulary from "../../../../context/vocabulary/useVocabulary";
import PreLoader from "../../../../components/PreLoader/PreLoader";
import SpeakButton from "../../../../components/SpeakButton/SpeakButton";
import styles from "./random-repead-flip-card.module.scss";

function RandomRepeadFlipCard() {
  const { getRandomRepeatWords, speakWord, speakActive } = useVocabulary();
  const [params] = useSearchParams();
  const language = params.get("language");
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [pendingDirection, setPendingDirection] = useState(null);
  const currentResult = result?.language === language ? result : null;

  const concepts = currentResult?.concepts;
  const totalQuestions = concepts?.length ?? 0;
  const questionNumber = totalQuestions ? currentQuestion + 1 : 0;
  const firstTranslation = 0;
  const secondTranslation = 1;

  useEffect(() => {
    if (!language) {
      return;
    }

    const controller = new AbortController();

    async function loadCards() {
      try {
        const data = await getRandomRepeatWords(language, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) {
          return;
        }

        const items = Array.isArray(data) ? data : data?.concepts ?? data?.results;
        const concepts = Array.isArray(items)
          ? items.filter(
              (item) => item?.translations?.[0]?.word && item?.translations?.[1]?.word,
            )
          : [];
        setCurrentQuestion(0);
        setIsFlipped(false);
        setPendingDirection(null);
        setResult({ language, concepts });
      } catch (error) {
        if (!controller.signal.aborted) {
          const message = error.message || "Die Karteikarten konnten nicht geladen werden.";
          setResult({ language, error: message });
          toast.error(message);
        }
      }
    }

    loadCards();
    return () => controller.abort();
  }, [language, getRandomRepeatWords]);


  function cancel() {
    navigate(`/my-quiz/all-words?${params}`);
  }


  function progressBar(hidden) {
    return (
      <div
        className={styles.progress}
        role="progressbar"
        aria-hidden={hidden}
        aria-label="Quizfortschritt"
        aria-valuemin={0}
        aria-valuemax={totalQuestions || 1}
        aria-valuenow={questionNumber}
      >
        <span
          className={styles["progress__fill"]}
          style={{
            width: `${totalQuestions ? (questionNumber / totalQuestions) * 100 : 0}%`,
          }}
        />
      </div>
    );
  }


  function toggleFlipped() {
    setIsFlipped((prev) => !prev);
  }


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
    const isLastWord = currentQuestion === totalQuestions - 1;

    if (isLastWord) {
      setCurrentQuestion(0);
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  }


  function showPreviousQuestion() {
    const isFirstWord = currentQuestion === 0;

    if (isFirstWord) {
      setCurrentQuestion(totalQuestions - 1);
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

  const status = !language
    ? "Bitte wähle zuerst eine Sprache aus."
    : currentResult?.error;

  return (
    <section className={`play-quiz ${styles["play-quiz"]}`}>
      {totalQuestions ? (
        <div
          className={`${styles["flip-card-inner"]} ${isFlipped ? styles["flipped"] : ""}`}
          onTransitionEnd={handleTransitionEnd}
        >
          {/* FRONT */}
          <div className={styles["flip-card-front"]}>
            {progressBar(isFlipped)}
            <span className={styles["quiz-name"]}>Zufällige Karteikarten</span>

            {/* Sound */}
            <button
              className={styles["sound-button"]}
              type="button"
              onClick={() =>
                speakWord(
                  concepts[currentQuestion].translations[firstTranslation]
                    .word,
                  concepts[currentQuestion].translations[firstTranslation]
                    .language_code,
                )
              }
            >
              <SpeakButton speakActive={speakActive} />
            </button>
            {/* Sound Ende */}

            <span className={styles["languages"]}>
              {
                concepts[currentQuestion].translations[firstTranslation]
                  .language_name
              }{" "}
              →{" "}
              {
                concepts[currentQuestion].translations[secondTranslation]
                  .language_name
              }
            </span>

            <button
              type="button"
              className={styles["quiz-card__cancel"]}
              onClick={cancel}
            >
              <img width={25} height={25} src="/assets/xbox.svg" alt="Close" />
            </button>

            <div className={styles["quiz-card__header"]}>
              <h1
                className={`${styles["quiz-card__title-learn"]} ${styles["flip-title"]}`}
              >
                {
                  concepts[currentQuestion].translations[firstTranslation]
                    .word
                }
              </h1>
            </div>

            <div className={styles["quiz-card__form"]}>
              {/* Buttons */}
              <div className={styles["buttons-flip"]}>
                <button
                  type="button"
                  className={styles["flip-card-button"]}
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
                  className={styles["flip-card-button"]}
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
                  className={styles["turn-around"]}
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
              <span></span>
            </div>
          </div>
          {/* Front ENDE*/}

          {/* Back */}
          <div className={styles["flip-card-back"]}>
            {progressBar(!isFlipped)}
            <span className={styles["languages"]}>
              {
                concepts[currentQuestion].translations[secondTranslation]
                  .language_name
              }
            </span>

            {/* Sound */}
            <button
              onClick={() =>
                speakWord(
                  concepts[currentQuestion].translations[secondTranslation]
                    .word,
                  concepts[currentQuestion].translations[secondTranslation]
                    .language_code,
                )
              }
            >
              <SpeakButton speakActive={speakActive} />
            </button>
            {/* Sound Ende */}

            <button
              type="button"
              className={styles["quiz-card__cancel"]}
              onClick={cancel}
            >
              <img width={25} height={25} src="/assets/xbox.svg" alt="Close" />
            </button>

            {/* translation */}
            <div className={styles["quiz-card__form"]}>
              <span className={styles["quiz-card__line"]}></span>

              <h1
                className={`${styles["quiz-card__answer-wrapper-learn"]} ${styles["flip-title"]}`}
              >
                {
                  concepts[currentQuestion].translations[secondTranslation]
                    .word
                }
              </h1>
            </div>

            {/* Buttons */}
            <div className={styles["buttons-flip"]}>
              <button
                type="button"
                className={styles["flip-card-button"]}
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
                className={styles["flip-card-button"]}
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
                className={styles["turn-around"]}
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
            <span>
              {
                concepts[currentQuestion].translations[secondTranslation]
                  .sentence
              }
            </span>
            {/* Buttons ENDE */}
          </div>
          {/* Back ENDE */}
        </div>
      ) : (
        <div className={styles["quiz-card"]}>
          {status ? <p role="status">{status}</p> : <PreLoader />}
          <button type="button" className={styles["quiz-card__cancel"]}
            aria-label="Zurück zu allen Wörtern" onClick={cancel}>
            <img width={25} height={25} src="/assets/xbox.svg" alt="" />
          </button>
        </div>
      )}
    </section>
  );
}

export default RandomRepeadFlipCard;
