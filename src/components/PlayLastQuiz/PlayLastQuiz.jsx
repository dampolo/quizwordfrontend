import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useQuiz from "../../context/useQuiz";
import styles from "./play-last-quiz.module.scss";

function PlayLastQuiz({ redirect = false }) {
  const { getLastQuiz, loading } = useQuiz();
  const navigate = useNavigate();

  async function playLastQuiz() {
    try {
      const quiz = await getLastQuiz();
      navigate(
        `/my-quiz/${quiz.quiz_id}/play-quiz?language=${quiz.target_language}${redirect ? "&redirect=true" : ""}`,
      );
    } catch (error) {
      toast.error(
        error.response?.detail || "Das letzte Quiz konnte nicht geladen werden.",
      );
    }
  }

  return (
    <div className={styles["play-last-quiz"]}>
      <h3>Quiz</h3>
      <p>Fange das letzte Quiz an.</p>
      <button type="button" onClick={playLastQuiz} disabled={loading}>
        Start
      </button>
    </div>
  );
}

export default PlayLastQuiz;
