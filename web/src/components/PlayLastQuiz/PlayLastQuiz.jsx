import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import useQuiz from "../../context/quiz/useQuiz";
import styles from "./play-last-quiz.module.scss";

function PlayLastQuiz({ redirect = false }) {
  const { t } = useTranslation();
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
        error.response?.detail || t("ACTIVE_QUIZZES.LAST_ERROR"),
      );
    }
  }

  return (
    <div className={styles["play-last-quiz"]}>
      <h3>Quiz</h3>
      <p>{t("ACTIVE_QUIZZES.LAST_DESCRIPTION")}</p>
      <button type="button" onClick={playLastQuiz} disabled={loading}>
        {t("ACTIVE_QUIZZES.START")}
      </button>
    </div>
  );
}

export default PlayLastQuiz;
