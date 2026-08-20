import { useLocation, useParams, Link } from "react-router-dom";
import "./quiz-results.scss"
import BackButton from "../../../../components/BackButton/BackButton";

function QuizResults() {
  const { id } = useParams();
  const { state } = useLocation();
  console.log(state);

  const details = state?.results || [];

  return (
    <section className="results">
        <BackButton to={`/my-quiz/${id}/all-quiz-words/`} />
      <div className="vocabulary-card">

        <div className="card-header">
          <h3>Deine Ergebnise</h3>
          <span className="badge">{details.length} Wörter</span>
        </div>

        <div className="table">
          {details.map((item) => (
            <div
              key={item.word_id}
              className={`table-row ${!item.is_correct ? "wrong" : ""}`}
            >
              <div className="status">
                <span
                  className={item.is_correct ? "icon success" : "icon error"}
                >
                  {item.is_correct ? "✓" : "✕"}
                </span>
              </div>

              <div className="column">
                <span className="label">WORT</span>
                <h4>{item.source_word}</h4>
              </div>

              <div className="column">
                <span className="label">ANTWORT</span>
                <p className={!item.is_correct ? "incorrect" : ""}>
                  {item.user_answer}
                </p>
              </div>

              <div className="column">
                <span className="label">Bedeutung</span>
                <p className="correct">{item.correct_answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
        <Link
          className="main-quiz-button add-btn"
          to={`/my-quiz/${id}/play-quiz`}
        >
          Wiederholen
        </Link>
    </section>
  );
}

export default QuizResults;
