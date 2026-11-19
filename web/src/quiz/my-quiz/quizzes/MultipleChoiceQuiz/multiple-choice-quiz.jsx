import styles from "./multiple-choice-quiz.module.scss";

const choices = [
  { letter: "A", word: "Das Pferd"},
  { letter: "B", word: "Der Hund"},
  { letter: "C", word: "Die Katze"},
  { letter: "D", word: "Das Schaf"},
];

function MultipleChoiceQuiz() {
  return (
    <section className="play-quiz">
      <div
        className={styles.quiz}
        aria-label="Multiple-Choice-Quiz"
      >
        <header className={styles.header}>
          <div>
            <div className={styles.prompt}>
              <span>Was ist die richtige Übersetzung für:</span>
            </div>
            <div className={styles.word}>
              <h1>horse</h1>
              <button
                className={styles.audio}
                type="button"
                aria-label="Aussprache anhören"
              >
                <img src="/assets/hear.svg" alt="" />
              </button>
            </div>
          </div>
        </header>

        <fieldset
          className={styles.choices}
          aria-labelledby="multiple-choice-prompt"
        >
          {choices.map(({ letter, word }) => (
            <label className={styles.choice} key={letter}>
              <span className={styles.letter} aria-hidden="true">
                {letter}
              </span>
              <span>
                <strong>{word}</strong>
              </span>
              <input
                className={styles.radio}
                type="radio"
                name="multiple-choice-answer"
                value={letter}
              />
            </label>
          ))}
        </fieldset>

        <footer className={styles.actions}>
          <button className={styles.hint} type="button">
            <span aria-hidden="true">💡</span> Tipp anzeigen
          </button>
          <div className={styles.answerActions}>
            <button className="main-quiz-button" type="button">
              Weiter
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}

export default MultipleChoiceQuiz;
