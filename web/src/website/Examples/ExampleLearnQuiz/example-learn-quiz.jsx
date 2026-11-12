import { useState } from "react";
import styles from "../../../quiz/my-quiz/quizzes/LearnQuiz/learn-quiz.module.scss";

export default function ExampleLearnQuiz({
  title,
  words,
  onClose,
  t,
  sourceLanguage = "de",
  targetLanguage = "en",
}) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const word = words[currentWordIndex];
  const wordNumber = word ? currentWordIndex + 1 : 0;
  const progress = words.length ? (wordNumber / words.length) * 100 : 0;

  function nextWord() {
    setCurrentWordIndex((index) => (index + 1) % words.length);
  }

  return (
    <div className={`${styles["quiz-card"]} ${styles["learn-card"]}`}>
      <div
        className={styles.progress}
        role="progressbar"
        aria-label={t("PROGRESS")}
        aria-valuemin={0}
        aria-valuemax={words.length || 1}
        aria-valuenow={wordNumber}
      >
        <span className={styles["progress__fill"]} style={{ width: `${progress}%` }} />
      </div>
      <span id="example-quiz-title" className={styles["quiz-card__quiz-name"]}>
        {title}
      </span>
      <button
        type="button"
        className={styles["quiz-card__cancel"]}
        onClick={onClose}
        aria-label={t("CLOSE")}
      >
        <img width={25} height={25} src="/assets/xbox.svg" alt="" />
      </button>
      <div className={styles["quiz-card__header"]}>
        <h1 className={styles["quiz-card__title-learn"]} lang={sourceLanguage}>
          {word?.[sourceLanguage]}
        </h1>
      </div>
      <div className={styles["quiz-card__form"]}>
        <span className={styles["quiz-card__line"]} />
        <span className={styles["quiz-card__answer-wrapper-learn"]} lang={targetLanguage}>
          {word?.[targetLanguage]}
        </span>
      </div>
      <button type="button" className="main-quiz-button" onClick={nextWord} disabled={!word}>
        <span>{t("LEARN_NEXT")}</span>
      </button>
    </div>
  );
}
