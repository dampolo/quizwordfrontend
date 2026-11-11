import ExampleFlipCardQuiz from "../ExampleFlipCardQuiz/example-flip-card-quiz";

export default function ExampleFlipCardQuizReverse({ title, words, onClose }) {
  return <ExampleFlipCardQuiz title={title} words={words} onClose={onClose} reverse />;
}
