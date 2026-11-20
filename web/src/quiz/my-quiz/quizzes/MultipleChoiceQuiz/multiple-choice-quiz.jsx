import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import styles from "./multiple-choice-quiz.module.scss";
import useQuiz from "@quizword/shared/quiz/useQuiz";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function MultipleChoiceQuiz() {
  const { getMultipleChoiceQuiz, postQuizAnswers } = useQuiz();
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") === "true";
  const language = searchParams.get("language");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const concepts = quiz?.concepts ?? [];
  const currentConcept = concepts[currentQuestionIndex];
  const questionTranslations = currentConcept?.translations;

  const [formData, setFormData] = useState({
    answer: "",
  });

  function handleAnswer(event, option) {
    const answer = event.currentTarget.value;
    setSelectedOption(option);
    setFormData((previous) => ({ ...previous, answer }));
    console.log(answer);
    
  }

  function cancel() {
    if (redirect) {
      navigate(`/my-quiz/all-quizzes?language=${language}`);
    } else {
      navigate(`/my-quiz/${id}/all-quiz-words`);
    }
  }

  async function adjustCurrentQuestion() {
    if (!currentConcept || !formData.answer || isSubmitting) return;

    const updatedAnswers = [
      ...answers,
      { id: currentConcept.id, answer: formData.answer },
    ];

    console.log(updatedAnswers);
    

    if (currentQuestionIndex === concepts.length - 1) {
      setIsSubmitting(true);
      try {
        const result = await postQuizAnswers(id, {
          direction: "FORWARD",
          answers: updatedAnswers,
        });
        navigate(`/my-quiz/${id}/quiz-results?language=${language}&redirect=true`, { state: result });
      } catch (error) {
        toast.error(error.message || "Quiz could not be submitted.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setAnswers(updatedAnswers);
    setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
    setSelectedOption(null);
    setFormData({ answer: "" });
  }

  useEffect(() => {
    async function loadData() {
      try {
        const quizData = await getMultipleChoiceQuiz(id, language);

        setQuiz(quizData);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setSelectedOption(null);
        setFormData({ answer: "" });
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
              <h1>{questionTranslations?.[0]?.word}</h1>
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
          disabled={isSubmitting}
          className={styles.choices}
          aria-labelledby="multiple-choice-prompt"
        >
          <label className={styles.choice}>
            <span className={styles.letter} aria-hidden="true">
              A
            </span>
            <span>
              <strong>{questionTranslations?.[1]?.word}</strong>
            </span>
            <input
              className={styles.radio}
              onChange={(event) => handleAnswer(event, "A")}
              type="radio"
              name="multiple-choice-answer"
              value={questionTranslations?.[1]?.word ?? ""}
              checked={selectedOption === "A"}
              disabled={!questionTranslations?.[1]?.word}
            />
          </label>
          <label className={styles.choice}>
            <span className={styles.letter} aria-hidden="true">
              B
            </span>
            <span>
              <strong>{questionTranslations?.[2]?.word}</strong>
            </span>
            <input
              className={styles.radio}
              onChange={(event) => handleAnswer(event, "B")}
              type="radio"
              name="multiple-choice-answer"
              value={questionTranslations?.[2]?.word ?? ""}
              checked={selectedOption === "B"}
              disabled={!questionTranslations?.[2]?.word}
            />
          </label>
          <label className={styles.choice}>
            <span className={styles.letter} aria-hidden="true">
              C
            </span>
            <span>
              <strong>{questionTranslations?.[3]?.word}</strong>
            </span>
            <input
              className={styles.radio}
              onChange={(event) => handleAnswer(event, "C")}
              type="radio"
              name="multiple-choice-answer"
              value={questionTranslations?.[3]?.word ?? ""}
              checked={selectedOption === "C"}
              disabled={!questionTranslations?.[3]?.word}
            />
          </label>
          <label className={styles.choice}>
            <span className={styles.letter} aria-hidden="true">
              D
            </span>
            <span>
              <strong>{questionTranslations?.[4]?.word}</strong>
            </span>
            <input
              className={styles.radio}
              onChange={(event) => handleAnswer(event, "D")}
              type="radio"
              name="multiple-choice-answer"
              value={questionTranslations?.[4]?.word ?? ""}
              checked={selectedOption === "D"}
              disabled={!questionTranslations?.[4]?.word}
            />
          </label>
        </fieldset>

        <footer className={styles.actions}>
          <button type="button" className={styles.hint}>
            <span aria-hidden="true">💡</span> Tipp anzeigen
          </button>
          <div className={styles.answerActions}>
            <button
              type="button"
              className="main-quiz-button"
              disabled={!formData.answer || isSubmitting}
              onClick={adjustCurrentQuestion}
            >
              {
                currentQuestionIndex === concepts.length - 1 ? "Prüfen" : "Weiter"
              }
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}

export default MultipleChoiceQuiz;
