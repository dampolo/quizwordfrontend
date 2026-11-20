import {
  useLocation,
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import styles from "./quiz-results.module.scss";
import BackButton from "../../../../components/BackButton/BackButton";

function QuizResults() {
  const { id } = useParams();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirect = searchParams.get("redirect") === "true";
  const language = searchParams.get("language");

  function repead() {
    if (redirect) {
      // Multichoice
      navigate(`/my-quiz/${id}/multiple-choice-quiz?language=${language}`);
    } else {
      navigate(`/my-quiz/${id}/play-quiz`);
    }
  }

  const details = state?.results || [];

  return (
    <section className={styles["results"]}>
      <BackButton to={`/my-quiz/${id}/all-quiz-words/`} />
      <div className={styles["vocabulary-card"]}>
        <div className={styles["card-header"]}>
          <h3>Deine Ergebnise</h3>
          <span className={styles["badge"]}>{details.length} Wörter</span>
        </div>

        <div className={styles["table"]}>
          {details.map((item) => (
            <div
              key={item.word_id}
              className={`${styles["table-row"]} ${!item.is_correct ? styles["wrong"] : ""}`}
            >
              <div className={styles["status"]}>
                <span
                  className={`${styles["icon"]} ${item.is_correct ? styles["success"] : styles["error"]}`}
                >
                  {item.is_correct ? "✓" : "✕"}
                </span>
              </div>

              <div className={styles["column"]}>
                <span className={styles["label"]}>Wort</span>
                <h4>{item.source_word}</h4>
              </div>

              <div className={styles["column"]}>
                <span className={styles["label"]}>Antwort</span>
                <p className={!item.is_correct ? styles["incorrect"] : ""}>
                  {item.user_answer}
                </p>
              </div>

              <div className={styles["column"]}>
                <span className={styles["label"]}>Richtig</span>
                <p className={styles["correct"]}>{item.correct_answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles["action-buttons"]}>
        <Link
          className={`main-quiz-button-cancel ${styles["cancel-btn"]}`}
          to={`/my-quiz/${id}/all-quiz-words/`}
        >
          Zurück
        </Link>
        <Link
          className={`main-quiz-button ${styles["save-btn"]}`}
          onClick={repead}
        >
          Wiederholen
        </Link>
      </div>
    </section>
  );
}

export default QuizResults;
