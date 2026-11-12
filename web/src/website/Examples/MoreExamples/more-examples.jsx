import Tooltip from "@mui/material/Tooltip";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import BackButton from "../../../components/BackButton/BackButton";
import ExampleLearnQuiz from "../ExampleLearnQuiz/example-learn-quiz";
import ExamplePlayQuiz from "../ExamplePlayQuiz/example-play-quiz";
import "../Examples.scss";
import "./more-examples.scss";
import { moreExamples } from "./more-examples-data";

const languageCodes = {
  english: "en",
  german: "de",
  spain: "es",
  french: "fr",
};

export default function MoreExamples() {
  const { t, i18n } = useTranslation();
  const label = (key, options) => t("WEBSITE.EXAMPLES." + key, options);

  const languages = Object.keys(moreExamples);
  const [activeLanguage, setActiveLanguage] = useState("english");
  const [quizSession, setQuizSession] = useState(null);
  const quizDialog = useRef(null);
  const targetLanguage = languageCodes[activeLanguage];
  const sourceLanguageKey = activeLanguage === "german" ? "english" : "german";
  const sourceLanguage = languageCodes[sourceLanguageKey];
  const languageNames = new Intl.DisplayNames(i18n.resolvedLanguage, {
    type: "language",
  });
  const quizWords = quizSession
    ? moreExamples[activeLanguage][quizSession.category].map((word, index) => ({
        [sourceLanguage]: moreExamples[sourceLanguageKey][quizSession.category][index],
        [targetLanguage]: word,
      }))
    : [];

  function openQuiz(category, mode) {
    setQuizSession({ category, mode });
    quizDialog.current.showModal();
  }

  function renderQuiz() {
    if (!quizSession) return null;

    const quizProps = {
      title: label(quizSession.category.toUpperCase()),
      words: quizWords,
      sourceLanguage,
      targetLanguage,
    };

    if (quizSession.mode === "test") {
      return <ExamplePlayQuiz {...quizProps} />;
    }

    if (quizSession.mode === "preview") {
      return (
        <>
          <button
            type="button"
            className="examples__preview-close"
            aria-label={label("CLOSE")}
            onClick={() => quizDialog.current.close()}
          >
            <img width={25} height={25} src="/assets/xbox.svg" alt="" />
          </button>
          <div className="examples__preview-list">
            <h2 id="example-quiz-title" className="examples__preview-heading">
              {quizProps.title} - {label("preview")}
            </h2>
            {quizWords.map((word) => (
              <div className="examples__preview-row" key={word[sourceLanguage]}>
                <h3 lang={sourceLanguage}>{word[sourceLanguage]}</h3>
                <span aria-hidden="true">→</span>
                <p lang={targetLanguage}>{word[targetLanguage]}</p>
              </div>
            ))}
          </div>
        </>
      );
    }

    return (
      <ExampleLearnQuiz
        {...quizProps}
        onClose={() => quizDialog.current.close()}
        t={label}
      />
    );
  }

  return (
    <main className="more-examples">
      <BackButton
        to="/"
        className="more-examples__back"
        label={t("WEBSITE.EXAMPLES.BACK_TO_HOME")}
      />
      <h1 className="more-examples__title">
        {t("WEBSITE.EXAMPLES.MORE_EXAMPLES")}
      </h1>
      <ul className="more-examples__languages-list">
        {languages.map((item) => (
          <li key={item}>
            <button
              type="button"
              className="more-examples__language"
              aria-pressed={activeLanguage === item}
              onClick={() => setActiveLanguage(item)}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>

      <div className="category">
        {Object.entries(moreExamples[activeLanguage]).map(([id, words]) => (
          <article
            className="examples__quiz"
            data-quiz-id={id}
            key={id}
          >
            <header className="examples__quiz-heading">
              <h3>{label(id.toUpperCase())}</h3>
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
                  onClick={() => openQuiz(id, "learn")}
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
                  onClick={() => openQuiz(id, "test")}
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
                  onClick={() => openQuiz(id, "preview")}
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
              <button
                type="button"
                data-quiz-action="preview"
                onClick={() => openQuiz(id, "preview")}
              >
                {label("WORD_COUNT", { count: words.length })}
              </button>
              <span>
                {languageNames.of(sourceLanguage)} / {languageNames.of(targetLanguage)}
              </span>
            </footer>
          </article>
        ))}
      </div>
      <dialog
        ref={quizDialog}
        className={quizSession?.mode === "preview" ? "examples__preview" : "examples__quiz-dialog"}
        aria-labelledby="example-quiz-title"
        onClose={() => setQuizSession(null)}
      >
        {renderQuiz()}
      </dialog>
    </main>
  );
}
