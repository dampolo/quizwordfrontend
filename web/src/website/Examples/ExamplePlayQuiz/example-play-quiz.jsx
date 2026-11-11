import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../../quiz/my-quiz/quizzes/PlayQuiz/play-quiz.module.scss";

export default function ExamplePlayQuiz({ title, words }) {
  const { t } = useTranslation();
  const inputId = useId();
  const hintId = useId();
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [hint, setHint] = useState(false);
  const word = words[answers.length];
  const questionNumber = Math.min(answers.length + 1, words.length);
  const label = (key, options) => t("WEBSITE.EXAMPLES." + key, options);

  function submitAnswer(event) {
    event.preventDefault();
    const submittedAnswer = answer.trim();
    if (!submittedAnswer || !word) return;

    setAnswers([...answers, {
      word,
      submittedAnswer,
      correct: submittedAnswer.toLowerCase() === word.en.toLowerCase(),
    }]);
    setAnswer("");
    setHint(false);
  }

  return (
    <div className={styles["quiz-card"]}>
      <div
        className={styles.progress}
        role="progressbar"
        aria-label={label("PROGRESS")}
        aria-valuemin={0}
        aria-valuemax={words.length}
        aria-valuenow={questionNumber}
      >
        <span
          className={styles["progress__fill"]}
          style={{ width: (questionNumber / words.length) * 100 + "%" }}
        />
      </div>
      <span className={styles["quiz-card__languages"]}>{label("LANGUAGES")}</span>
      <span id="example-quiz-title" className={styles["quiz-card__quiz-name"]}>
        {title}
      </span>
      <form method="dialog">
        <button className={styles["quiz-card__cancel"]} aria-label={label("CLOSE")}>
          <img width={25} height={25} src="/assets/xbox.svg" alt="" />
        </button>
      </form>

      {word ? (
        <>
          <div className={styles["quiz-card__header"]}>
            <h2 className={styles["quiz-card__title"]} lang="de">{word.de}</h2>
          </div>
          <label htmlFor={inputId} className={styles["quiz-card__subtitle"]}>
            {label("TRANSLATION")}
          </label>
          <div className={styles["hint-container"]}>
            <div id={hintId} className={styles[hint ? "show-hint" : "hide-hint"]}>
              <p className={styles["hint-text"]}>{label("FIRST_LETTER", { letter: word.en[0] })}</p>
            </div>
          </div>
          <form className={styles["quiz-card__form"]} onSubmit={submitAnswer}>
            <div className={styles["quiz-card__input-wrapper"]}>
              <input
                id={inputId}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                className={styles["quiz-card__input"]}
                aria-describedby={hint ? hintId : undefined}
                autoComplete="off"
                spellCheck={false}
                lang="en"
                required
              />
              <button
                type="button"
                className={styles["quiz-card__help"]}
                aria-label={label("HINT")}
                aria-expanded={hint}
                aria-controls={hintId}
                onClick={() => setHint(!hint)}
              >
                ?
              </button>
            </div>
            <button
              type="submit"
              className={"main-quiz-button " + styles["play-button"]}
              disabled={!answer.trim()}
            >
              {label(questionNumber === words.length ? "SHOW_RESULTS" : "NEXT")}
            </button>
          </form>
        </>
      ) : (
        <>
          <h2 role="status">
            {label("SCORE", {
              correct: answers.filter((entry) => entry.correct).length,
              total: words.length,
            })}
          </h2>
          <ul className="examples__words">
            {answers.map(({ word, submittedAnswer, correct }) => (
              <li key={word.de}>
                <span lang="de">{word.de}</span>
                <span lang="en">
                  {correct ? submittedAnswer : <><s>{submittedAnswer}</s> → {word.en}</>}
                </span>
              </li>
            ))}
          </ul>
          <button type="button" className="main-quiz-button" onClick={() => setAnswers([])}>
            {label("RESTART")}
          </button>
        </>
      )}
    </div>
  );
}
