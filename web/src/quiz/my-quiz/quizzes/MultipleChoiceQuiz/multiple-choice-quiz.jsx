import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import styles from "./multiple-choice-quiz.module.scss";
import useQuiz from "@quizword/shared/quiz/useQuiz";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const choices = [
  { letter: "A", word: "Das Pferd" },
  { letter: "B", word: "Der Hund" },
  { letter: "C", word: "Die Katze" },
  { letter: "D", word: "Das Schaf" },
];

function MultipleChoiceQuiz() {
  const { getMultipleChoiceQuiz } = useQuiz();
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirect = searchParams.get("redirect");
  const language = searchParams.get("language");

  function cancel() {
    if (redirect) {
      navigate(`/my-quiz/all-quizzes?language=${language}`);
    } else {
      navigate(`/my-quiz/${id}/all-quiz-words`);
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const quizData = await getMultipleChoiceQuiz(id, language);
        
        setQuiz(quizData);
        console.log(quizData);
      } catch (error) {
        toast.error(
          error.response?.message ?? error.response?.detail ?? error.message,
        );

        // toast.error(`Failed to load quiz. ${error}`);
      }
    }
    loadData();
  }, [id, language]);

  return (
    <section className="play-quiz">
      <div className={styles.quiz} aria-label="Multiple-Choice-Quiz">
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

          <button
            type="button"
            onClick={cancel}
            className={styles["quiz-card__cancel"]}
          >
            <img width={25} height={25} src="/assets/xbox.svg" alt="Close" />
          </button>
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
