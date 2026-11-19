import styles from "./multiple-choice-quiz.module.scss";

const choices = [
  { letter: "A", word: "Das Pferd", gender: "Neutrum", kuku: "kuku" },
  { letter: "B", word: "Der Hund", gender: "Maskulin", kuku: "kuku"},
  { letter: "C", word: "Die Katze", gender: "Feminin", kuku: "kuku" },
  { letter: "D", word: "Das Schaf", gender: "Neutrum", kuku: "kuku" },
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
              <span className={styles.category}>
                Substantiv (Nomen) • Tierwelt
              </span>
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
          {choices.map(({ letter, word, gender, kuku }) => (
            <label className={styles.choice} key={letter}>
              <span className={styles.letter} aria-hidden="true">
                {letter}
              </span>
              <span>
                <strong>{word}</strong>
                <small>Singular • {gender}</small>
                <small>{kuku}</small>
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
