import { useState } from "react";
import styles from "./learn-quiz.module.scss";

export default function LearnQuizCard({
  quizName,
  words,
  onClose,
  titleId,
  closeLabel = "Close",
  nextLabel = "Weiter",
  progressLabel = "Quizfortschritt",
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const totalQuestions = words.length;
  const word = words[currentQuestion];
  const questionNumber = word ? currentQuestion + 1 : 0;
  const progress = totalQuestions ? (questionNumber / totalQuestions) * 100 : 0;

  // Continue from the first word after the last one.
  function nextWord() {
    setCurrentQuestion((previous) => (previous + 1) % totalQuestions);
  }

  return (
    <div className={`${styles["quiz-card"]} ${styles["learn-card"]}`}>
      <div
        className={styles.progress}
        role="progressbar"
        aria-label={progressLabel}
        aria-valuemin={0}
        aria-valuemax={totalQuestions || 1}
        aria-valuenow={questionNumber}
      >
        <span className={styles["progress__fill"]} style={{ width: `${progress}%` }} />
      </div>
      <span id={titleId} className={styles["quiz-card__quiz-name"]}>
        {quizName}
      </span>
      <button type="button" className={styles["quiz-card__cancel"]} onClick={onClose} aria-label={closeLabel}>
        <img width={25} height={25} src="/assets/xbox.svg" alt="" />
      </button>
      <div className={styles["quiz-card__header"]}>
        <h1 className={styles["quiz-card__title-learn"]} lang={word?.sourceLanguage}>
          {word?.source}
        </h1>
      </div>
      <div className={styles["quiz-card__form"]}>
        <span className={styles["quiz-card__line"]} />
        <span className={styles["quiz-card__answer-wrapper-learn"]} lang={word?.targetLanguage}>
          {word?.target}
        </span>
      </div>
      <button type="button" className="main-quiz-button" onClick={nextWord} disabled={!word}>
        <span>{nextLabel}</span>
      </button>
    </div>
  );
}
