import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Tooltip from "@mui/material/Tooltip";
import ExampleLearnQuiz from "./ExampleLearnQuiz/example-learn-quiz";
import ExamplePlayQuiz from "./ExamplePlayQuiz/example-play-quiz";
import ExampleFlipCardQuiz from "./ExampleFlipCardQuiz/example-flip-card-quiz";
import ExampleFlipCardQuizReverse from "./ExampleFlipCardQuizReverse/example-flip-card-quiz-reverse";
import ExampleWordAudioLoop from "./ExampleWordAudioLoop/example-word-audio-loop";
import ExampleWordAudioLoopReverse from "./ExampleWordAudioLoopReverse/example-word-audio-loop-reverse";
import VJSlider from "vjslider/src/js/vjslider.js";
import "./Examples.scss";

const exampleQuizzes = {
  animals: {
    title: "ANIMALS",
    words: [
      { de: "Hund", en: "dog" },
      { de: "Katze", en: "cat" },
      { de: "Pferd", en: "horse" },
      { de: "Vogel", en: "bird" },
      { de: "Kaninchen", en: "rabbit" },
    ],
  },
  kitchen: {
    title: "KITCHEN",
    words: [
      { de: "Löffel", en: "spoon" },
      { de: "Gabel", en: "fork" },
      { de: "Messer", en: "knife" },
      { de: "Teller", en: "plate" },
      { de: "Tasse", en: "cup" },
    ],
  },
  garden: {
    title: "GARDEN",
    words: [
      { de: "Baum", en: "tree" },
      { de: "Blume", en: "flower" },
      { de: "Rasen", en: "lawn" },
      { de: "Schaufel", en: "shovel" },
      { de: "Gießkanne", en: "watering can" },
    ],
  },
  job: {
    title: "JOB",
    words: [
      { de: "Büro", en: "office" },
      { de: "Kollege", en: "colleague" },
      { de: "Besprechung", en: "meeting" },
      { de: "Aufgabe", en: "task" },
      { de: "Gehalt", en: "salary" },
    ],
  },
  holiday: {
    title: "HOLIDAY",
    words: [
      { de: "Strand", en: "beach" },
      { de: "Koffer", en: "suitcase" },
      { de: "Flughafen", en: "airport" },
      { de: "Reisepass", en: "passport" },
      { de: "Unterkunft", en: "accommodation" },
    ],
  },
};

export default function Examples() {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const sliderElement = useRef(null);
  const slider = useRef(null);
  const [session, setSession] = useState(null);
  const [titles, setTitles] = useState({});
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState("");
  const label = (key, options) => t("WEBSITE.EXAMPLES." + key, options);
  const quiz = session && exampleQuizzes[session.id];
  const mode = session?.mode;
  const word = quiz?.words[index];
  const flipcards = mode === "flipcards" || mode === "flipcardsReverse";
  const FlipCardQuiz =
    mode === "flipcardsReverse"
      ? ExampleFlipCardQuizReverse
      : ExampleFlipCardQuiz;
  const listening = mode === "listen";
  const audio = mode === "audio" || mode === "audioReverse";
  const AudioLoop =
    mode === "audioReverse"
      ? ExampleWordAudioLoopReverse
      : ExampleWordAudioLoop;
  const speech = window.speechSynthesis;

  useEffect(() => {
    const phoneViewport = window.matchMedia("(max-width: 32rem)");
    const tabletViewport = window.matchMedia("(max-width: 62rem)");

    function getSlideCount() {
      if (phoneViewport.matches) return 1;
      return tabletViewport.matches ? 2 : 3;
    }

    let slideCount = getSlideCount();
    const instance = new VJSlider(sliderElement.current, {
      numberOfVisibleSlides: slideCount,
    });
    slider.current = instance;

    const autoplayId = window.setInterval(() => {
      instance.next();
    }, 4000);

    function updateSlideCount() {
      const nextSlideCount = getSlideCount();
      if (nextSlideCount === slideCount) return;

      slideCount = nextSlideCount;
      instance.reload({ numberOfVisibleSlides: slideCount });
    }

    phoneViewport.addEventListener("change", updateSlideCount);
    tabletViewport.addEventListener("change", updateSlideCount);
    return () => {
      phoneViewport.removeEventListener("change", updateSlideCount);
      tabletViewport.removeEventListener("change", updateSlideCount);
      window.clearInterval(autoplayId);
      instance.destroy();
      slider.current = null;
    };
  }, [t]);

  useEffect(() => {
    // Keep the slider’s DOM copies in sync when an example title is edited.
    for (const slide of sliderElement.current.querySelectorAll(
      "[data-quiz-id]",
    )) {
      const id = slide.dataset.quizId;
      const heading = slide.querySelector("h3");
      const title =
        titles[id] ?? t("WEBSITE.EXAMPLES." + exampleQuizzes[id].title);
      if (heading.textContent !== title) heading.textContent = title;
    }
  }, [titles, t]);

  function handleCardClick(event) {
    // VJSlider clones slides, so handle actions on the shared container.
    const button = event.target.closest("button[data-quiz-action]");
    if (!button) return;
    const { quizId } = button.closest("[data-quiz-id]").dataset;
    openExample(quizId, button.dataset.quizAction);
  }

  function titleFor(id, example) {
    return titles[id] ?? label(example.title);
  }

  function openExample(id, mode) {
    setSession({ id, mode });
    setIndex(0);
    setRevealed(false);
    setAnswer(mode === "edit" ? titleFor(id, exampleQuizzes[id]) : "");
    if (mode !== "flipcards" && mode !== "flipcardsReverse") {
      dialogRef.current.showModal();
    }
  }

  function playAudio() {
    if (!speech) return;
    speech.cancel();
    const utterance = new SpeechSynthesisUtterance(word.en);
    utterance.lang = "en-GB";
    speech.speak(utterance);
  }

  function nextWord() {
    speech?.cancel();
    setIndex((current) => (current + 1) % quiz.words.length);
    setRevealed(false);
    setAnswer("");
  }

  function submitAnswer(event) {
    event.preventDefault();
    if (mode === "edit") {
      const title = answer.trim();
      if (title) {
        setTitles((current) => ({ ...current, [session.id]: title }));
        dialogRef.current.close();
      }
      return;
    }
    setRevealed(true);
  }

  return (
    <section className="examples" id="examples">
      <div className="examples__container">
        {/* Heading */}
        <div className="examples__heading">
          <h2 className="examples__title">{label("TITLE")}</h2>
          <p className="examples__subtitle">{label("DESCRIPTION")}</p>
        </div>

        {/* Cards */}
        <div className="examples__card">
          <div
            className="vjslider"
            ref={sliderElement}
            onClick={handleCardClick}
          >
            <div className="vjslider__slider">
              {Object.entries(exampleQuizzes).map(([id, example]) => (
                <article
                  className="vjslider__slide examples__quiz"
                  data-quiz-id={id}
                  key={id}
                >
                  <header className="examples__quiz-heading">
                    <h3>{titleFor(id, example)}</h3>
                    <Tooltip title={label("edit")} arrow>
                      <button
                        type="button"
                        aria-label={label("edit")}
                        data-quiz-action="edit"
                      >
                        <img
                          width={20}
                          height={20}
                          src="/assets/edit.svg"
                          alt=""
                        />
                      </button>
                    </Tooltip>
                  </header>

                  <div className="examples__actions">
                    <Tooltip title={label("learn")} placement="top" arrow>
                      <button
                        type="button"
                        aria-label={label("learn")}
                        data-quiz-action="learn"
                      >
                        <img
                          width={40}
                          height={40}
                          src="/assets/learn-quiz.svg"
                          alt=""
                        />
                      </button>
                    </Tooltip>

                    <Tooltip title={label("test")} placement="top" arrow>
                      <button
                        type="button"
                        aria-label={label("test")}
                        data-quiz-action="test"
                      >
                        <img
                          width={40}
                          height={40}
                          src="/assets/write.svg"
                          alt=""
                        />
                      </button>
                    </Tooltip>

                    <Tooltip title={label("preview")} placement="top" arrow>
                      <button
                        type="button"
                        aria-label={label("preview")}
                        data-quiz-action="preview"
                      >
                        <img
                          width={40}
                          height={40}
                          src="/assets/preview-quiz.svg"
                          alt=""
                        />
                      </button>
                    </Tooltip>

                    <Tooltip title={label("flipcards")} placement="top" arrow>
                      <button
                        type="button"
                        aria-label={label("flipcards")}
                        data-quiz-action="flipcards"
                      >
                        <img
                          width={40}
                          height={40}
                          src="/assets/flip-card.svg"
                          alt=""
                        />
                      </button>
                    </Tooltip>
                  </div>

                  <div className="examples__actions">
                    <Tooltip title={label("audio")} placement="top" arrow>
                      <button
                        type="button"
                        aria-label={label("audio")}
                        data-quiz-action="audio"
                      >
                        <img
                          width={40}
                          height={40}
                          src="/assets/repead.svg"
                          alt=""
                        />
                      </button>
                    </Tooltip>

                    <Tooltip title={label("listen")} placement="top" arrow>
                      <button
                        type="button"
                        aria-label={label("listen")}
                        data-quiz-action="listen"
                      >
                        <img
                          width={40}
                          height={40}
                          src="/assets/hear.svg"
                          alt=""
                        />
                      </button>
                    </Tooltip>

                    <Tooltip
                      title={label("flipcardsReverse")}
                      placement="top"
                      arrow
                    >
                      <button
                        type="button"
                        aria-label={label("flipcardsReverse")}
                        data-quiz-action="flipcardsReverse"
                      >
                        <img
                          width={40}
                          height={40}
                          src="/assets/flip-card-reverse.svg"
                          alt=""
                        />
                      </button>
                    </Tooltip>

                    <Tooltip
                      title={label("audioReverse")}
                      placement="top"
                      arrow
                    >
                      <button
                        type="button"
                        aria-label={label("audioReverse")}
                        data-quiz-action="audioReverse"
                      >
                        <img
                          width={40}
                          height={40}
                          src="/assets/repead-reverse.svg"
                          alt=""
                        />
                      </button>
                    </Tooltip>
                  </div>

                  <footer className="examples__quiz-footer">
                    <button type="button" data-quiz-action="preview">
                      {label("WORD_COUNT", { count: example.words.length })}
                    </button>
                    <span>{label("LANGUAGES")}</span>
                  </footer>
                </article>
              ))}
            </div>
          </div>
          <div className="examples__slider-controls">
            <button
              type="button"
              aria-label={label("PREVIOUS_QUIZ")}
              onClick={() => slider.current?.prev()}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              aria-label={label("NEXT_QUIZ")}
              onClick={() => slider.current?.next()}
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>
      </div>

      {flipcards && (
        <FlipCardQuiz
          title={titleFor(session.id, quiz)}
          words={quiz.words}
          onClose={() => setSession(null)}
        />
      )}

      <dialog
        ref={dialogRef}
        className={
          mode === "learn" || mode === "test" || audio
            ? "examples__quiz-dialog"
            : "examples__dialog"
        }
        aria-labelledby="example-quiz-title"
        onClose={() => {
          speech?.cancel();
          setSession(null);
        }}
      >
        {mode === "learn" ? (
          <ExampleLearnQuiz
            title={titleFor(session.id, quiz)}
            words={quiz.words}
            onClose={() => dialogRef.current.close()}
            t={label}
          />
        ) : mode === "test" ? (
          <ExamplePlayQuiz
            title={titleFor(session.id, quiz)}
            words={quiz.words}
          />
        ) : audio ? (
          <AudioLoop
            title={titleFor(session.id, quiz)}
            words={quiz.words}
            onClose={() => dialogRef.current.close()}
          />
        ) : (
          quiz &&
          !flipcards && (
            <>
              <form method="dialog" className="examples__close">
                <button aria-label={label("CLOSE")}>
                  <img width={25} height={25} src="/assets/xbox.svg" alt="" />
                </button>
              </form>
              <h3 id="example-quiz-title">
                {titleFor(session.id, quiz)} · {label(mode)}
              </h3>

              {listening && !speech && (
                <p role="status">{label("AUDIO_UNAVAILABLE")}</p>
              )}

              {mode === "preview" && (
                <ul className="examples__words">
                  {quiz.words.map((entry) => (
                    <li key={entry.de}>
                      <span lang="de">{entry.de}</span>
                      <span lang="en">{entry.en}</span>
                    </li>
                  ))}
                </ul>
              )}

              {mode === "edit" && (
                <form onSubmit={submitAnswer}>
                  <label>
                    {label("QUIZ_TITLE")}
                    <input
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      required
                      maxLength={50}
                    />
                  </label>
                  <button type="submit">{label("SAVE")}</button>
                </form>
              )}

              {word && listening && (
                <>
                  <p>
                    {index + 1} / {quiz.words.length}
                  </p>
                  {listening && (
                    <button
                      type="button"
                      onClick={playAudio}
                      disabled={!speech}
                    >
                      {label("PLAY_AUDIO")}
                    </button>
                  )}
                  {listening && (
                    <form onSubmit={submitAnswer}>
                      <label>
                        {label("HEARD_WORD")}
                        <input
                          value={answer}
                          onChange={(event) => setAnswer(event.target.value)}
                          required
                          disabled={revealed}
                          lang="en"
                        />
                      </label>
                      <button type="submit" disabled={revealed}>
                        {label("CHECK")}
                      </button>
                    </form>
                  )}
                  {revealed && listening && (
                    <p role="status">
                      {label(
                        answer.trim().toLowerCase() === word.en.toLowerCase()
                          ? "CORRECT"
                          : "INCORRECT",
                      )}
                    </p>
                  )}
                  {revealed && <p lang="en">{word.en}</p>}
                  <button type="button" onClick={nextWord}>
                    {label("NEXT")}
                  </button>
                </>
              )}
            </>
          )
        )}
      </dialog>
    </section>
  );
}
