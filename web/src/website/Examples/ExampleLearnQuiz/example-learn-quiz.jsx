import LearnQuizCard from "../../../quiz/my-quiz/quizzes/LearnQuiz/learn-quiz-card";

export default function ExampleLearnQuiz({ title, words, onClose, t }) {
  return (
    <LearnQuizCard
      quizName={title}
      words={words.map(({ de, en }) => ({
        source: de,
        target: en,
        sourceLanguage: "de",
        targetLanguage: "en",
      }))}
      onClose={onClose}
      titleId="example-quiz-title"
      closeLabel={t("CLOSE")}
      nextLabel={t("NEXT")}
      progressLabel={t("PROGRESS")}
    />
  );
}
