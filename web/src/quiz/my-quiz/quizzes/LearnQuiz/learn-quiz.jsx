import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import LearnQuizCard from "./learn-quiz-card";
import { useEffect, useState } from "react";
import useQuiz from "../../../../context/quiz/useQuiz";

function LearnQuiz() {
  const [quiz, setQuiz] = useState(null);
  const { id } = useParams();
  const { getQuizWords } = useQuiz();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") === "true";
  const language = searchParams.get("language");
  useEffect(() => {
    async function loadData() {
      try {
        const quizData = await getQuizWords(id);
        setQuiz(quizData);
      } catch (error) {
        console.error(error);
      }
    }
    loadData();
  }, [id]);

  function cancel() {
    if (redirect) {
      navigate(`/my-quiz/all-quizzes?language=${language}`);
    } else {
      navigate(`/my-quiz/${id}/all-quiz-words?language=${language}`);
    }
  }

  return (
    <section className="play-quiz">
      <LearnQuizCard
        key={id}
        quizName={quiz?.quiz_name}
        words={quiz?.concepts?.map(({ translations }) => ({
          source: translations[0]?.word,
          target: translations[1]?.word,
        })) ?? []}
        onClose={cancel}
      />
    </section>
  );
}

export default LearnQuiz;
