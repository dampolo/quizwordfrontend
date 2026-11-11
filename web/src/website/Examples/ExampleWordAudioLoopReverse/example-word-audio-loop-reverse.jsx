import ExampleWordAudioLoop from "../ExampleWordAudioLoop/example-word-audio-loop";

export default function ExampleWordAudioLoopReverse({ title, words, onClose }) {
  return (
    <ExampleWordAudioLoop title={title} words={words} onClose={onClose} reverse />
  );
}
