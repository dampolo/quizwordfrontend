import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import SpeakButton from "../../../components/SpeakButton/SpeakButton";
import styles from "../../../quiz/my-quiz/quizzes/FlipCardQuiz/flip-card-quiz.module.scss";
import "./example-flip-card-quiz.scss";

export default function ExampleFlipCardQuiz({ title, words, onClose, reverse = false }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [pendingStep, setPendingStep] = useState(0);
  const overlayRef = useRef(null);
  const label = (key) => t("WEBSITE.EXAMPLES." + key);
  const word = words[index];
  const speech = window.speechSynthesis;
  const frontLanguage = reverse ? "en" : "de";
  const backLanguage = reverse ? "de" : "en";
  const languageNames = { de: label("GERMAN"), en: label("ENGLISH") };

  useEffect(() => {
    const trigger = document.activeElement;
    return () => {
      speech?.cancel();
      trigger?.focus();
    };
  }, [speech]);

  useEffect(() => {
    overlayRef.current.focus();
  }, [flipped]);

  function handleKeys(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }

    if (event.key !== "Tab") return;
    const buttons = overlayRef.current.querySelectorAll("button:not(:disabled)");
    const available = Array.from(buttons).filter((button) => !button.closest("[inert]"));
    const first = available[0];
    const last = available.at(-1);
    const active = document.activeElement;
    if (event.shiftKey ? active === first || active === overlayRef.current : active === last) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  }

  useEffect(() => {
    if (!pendingStep) return;
    // Also advance if the browser skips the flip transition.
    const timeout = window.setTimeout(() => {
      setIndex((current) => (current + pendingStep + words.length) % words.length);
      setPendingStep(0);
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [pendingStep, words.length]);

  function move(step) {
    speech?.cancel();
    if (flipped) {
      setPendingStep(step);
      setFlipped(false);
      return;
    }
    setIndex((current) => (current + step + words.length) % words.length);
  }

  function finishFlip(event) {
    if (event.target !== event.currentTarget || event.propertyName !== "transform" || !pendingStep) return;
    setIndex((current) => (current + pendingStep + words.length) % words.length);
    setPendingStep(0);
  }

  function flip() {
    speech?.cancel();
    setFlipped((current) => !current);
  }

  function speak() {
    if (!speech) return;
    const language = flipped ? backLanguage : frontLanguage;
    const utterance = new SpeechSynthesisUtterance(word[language]);
    utterance.lang = language === "de" ? "de-DE" : "en-GB";
    speech.cancel();
    speech.speak(utterance);
  }

  const controls = (
    <div className={styles["buttons-flip"]}>
        <button type="button" aria-label={label("PREVIOUS")} className={styles["flip-card-button"]} disabled={!!pendingStep} onClick={() => move(-1)}>
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button type="button" aria-label={label("NEXT")} className={styles["flip-card-button"]} disabled={!!pendingStep} onClick={() => move(1)}>
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <button type="button" aria-label={label("FLIP_CARD")} className={styles["turn-around"]} disabled={!!pendingStep} onClick={flip}>
          <img width={48} height={48} src="/assets/turn-around.svg" alt="" />
        </button>
    </div>
  );

  function renderFace(isBack) {
    const language = isBack ? backLanguage : frontLanguage;

    return (
      <div
        className={`example-flip-card__face ${styles[isBack ? "flip-card-back" : "flip-card-front"]}`}
        inert={isBack !== flipped}
      >
        <div
          className={styles.progress}
          role="progressbar"
          aria-label={label("PROGRESS")}
          aria-valuemin={0}
          aria-valuemax={words.length}
          aria-valuenow={index + 1}
        >
          <span
            className={styles["progress__fill"]}
            style={{ width: ((index + 1) / words.length) * 100 + "%" }}
          />
        </div>
        {!isBack && <span className={styles["quiz-name"]}>{title}</span>}
        <span className={styles.languages}>
          {isBack ? languageNames[language] : `${languageNames[frontLanguage]} / ${languageNames[backLanguage]}`}
        </span>
        {speech && (
          <button type="button" aria-label={label("PLAY_AUDIO")} className={styles["sound-button"]} disabled={!!pendingStep} onClick={speak}>
            <SpeakButton />
          </button>
        )}
        <button type="button" className={styles["quiz-card__cancel"]} aria-label={label("CLOSE")} onClick={onClose}>
          <img width={25} height={25} src="/assets/xbox.svg" alt="" />
        </button>

        <div className={styles[isBack ? "quiz-card__form" : "quiz-card__header"]}>
          {isBack && <span className={styles["quiz-card__line"]} />}
          <h2
            className={`${styles[isBack ? "quiz-card__answer-wrapper-learn" : "quiz-card__title-learn"]} ${styles["flip-title"]}`}
            lang={language}
          >
            {word[language]}
          </h2>
        </div>
        {controls}
      </div>
    );
  }

  return createPortal(
    <section
      className={`play-quiz example-flip-card ${styles["play-quiz"]}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="example-quiz-title"
      tabIndex={-1}
      ref={overlayRef}
      onKeyDown={handleKeys}
    >
      <span id="example-quiz-title" className="visually-hidden">{title}</span>
      <div
        className={`example-flip-card__inner ${styles["flip-card-inner"]} ${flipped ? styles.flipped : ""}`}
        onTransitionEnd={finishFlip}
      >
        {/* Front and back use the same navigation controls. */}
        {renderFace(false)}
        {renderFace(true)}
      </div>
    </section>,
    document.body,
  );
}
