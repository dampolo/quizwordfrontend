import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import ExampleHearQuiz from "./ExampleHearQuiz/example-hear-quiz";
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
  const [answer, setAnswer] = useState("");
  const label = (key, options) => t("WEBSITE.EXAMPLES." + key, options);
  const quiz = session && exampleQuizzes[session.id];
  const mode = session?.mode;
  const flipcards = mode === "flipcards" || mode === "flipcardsReverse";
  const FlipCardQuiz =
    mode === "flipcardsReverse"
      ? ExampleFlipCardQuizReverse
      : ExampleFlipCardQuiz;
  const audio = mode === "audio" || mode === "audioReverse";
  const AudioLoop =
    mode === "audioReverse"
      ? ExampleWordAudioLoopReverse
      : ExampleWordAudioLoop;

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
      instance.destroy();
      slider.current = null;
    };
  }, [t]);

  useEffect(() => {
    if (session) return;

    const sliderNode = sliderElement.current;
    const autoplayId = window.setInterval(() => {
      if (sliderNode.matches(":hover")) return;

      slider.current?.next();
    }, 4000);

    return () => window.clearInterval(autoplayId);
  }, [session]);

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
    setAnswer(mode === "edit" ? titleFor(id, exampleQuizzes[id]) : "");
    if (mode !== "flipcards" && mode !== "flipcardsReverse") {
      dialogRef.current.showModal();
    }
  }

  function saveTitle(event) {
    event.preventDefault();
    const title = answer.trim();
    if (title) {
      setTitles((current) => ({ ...current, [session.id]: title }));
      dialogRef.current.close();
    }
  }

  function renderDialogContent() {
    switch (mode) {
      case "learn":
        return (
          <ExampleLearnQuiz
            title={titleFor(session.id, quiz)}
            words={quiz.words}
            onClose={() => dialogRef.current.close()}
            t={label}
          />
        );
      case "test":
        return (
          <ExamplePlayQuiz
            title={titleFor(session.id, quiz)}
            words={quiz.words}
          />
        );
      case "audio":
      case "audioReverse":
        return (
          <AudioLoop
            title={titleFor(session.id, quiz)}
            words={quiz.words}
            onClose={() => dialogRef.current.close()}
          />
        );
      case "preview":
        return (
          <>
            <button
              type="button"
              className="examples__preview-close"
              aria-label={label("CLOSE")}
              onClick={() => dialogRef.current.close()}
            >
              <img width={25} height={25} src="/assets/xbox.svg" alt="" />
            </button>
            <div className="examples__preview-list">
              <h2 id="example-quiz-title" className="examples__preview-heading">
                {titleFor(session.id, quiz)} — {label("preview")}
              </h2>
              {quiz.words.map((entry) => (
                <div className="examples__preview-row" key={entry.de}>
                  <h3 lang="de">{entry.de}</h3>
                  <span aria-hidden="true">→</span>
                  <p lang="en">{entry.en}</p>
                </div>
              ))}
            </div>
          </>
        );
      case "listen":
        return (
          <ExampleHearQuiz
            title={titleFor(session.id, quiz)}
            words={quiz.words}
            t={label}
          />
        );
      case "edit":
        return (
          <>
            <form method="dialog" className="examples__close">
              <button aria-label={label("CLOSE")}>
                <img width={25} height={25} src="/assets/xbox.svg" alt="" />
              </button>
            </form>
            <h3 id="example-quiz-title">
              {titleFor(session.id, quiz)} – {label(mode)}
            </h3>
            <form onSubmit={saveTitle}>
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
          </>
        );
      default:
        return null;
    }
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
              <span aria-hidden="true" className="examples__arrow-left" />
            </button>
            <button
              type="button"
              aria-label={label("NEXT_QUIZ")}
              onClick={() => slider.current?.next()}
            >
              <span aria-hidden="true" className="examples__arrow-right" />
            </button>
          </div>
        </div>
        <div className="examples__more">
          <Link
            to="/more-examples"
            className="examples__more-link main-quiz-button"
            aria-label={label("MORE_EXAMPLES")}
          >
            {label("MORE")}
          </Link>
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
          mode === "learn" || mode === "test" || mode === "listen" || audio
            ? "examples__quiz-dialog"
            : mode === "preview"
              ? "examples__preview"
              : "examples__dialog"
        }
        aria-labelledby="example-quiz-title"
        onClose={() => setSession(null)}
      >
        {renderDialogContent()}
      </dialog>
    </section>
  );
}
