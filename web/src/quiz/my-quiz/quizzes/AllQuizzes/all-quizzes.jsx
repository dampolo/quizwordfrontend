import PlayLastQuiz from "../../../../components/PlayLastQuiz/PlayLastQuiz";
import { useEffect, useRef, useState } from "react";
import styles from "./all-quizzes.module.scss";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useQuiz from "../../../../context/quiz/useQuiz";
import PreLoader from "../../../../components/PreLoader/PreLoader";
import useVocabulary from "../../../../context/vocabulary/useVocabulary";
import FormDialog from "../../../../components/FormDialog/FormDialog";
import { toast } from "react-toastify";
import Tooltip from "@mui/material/Tooltip";
import { useTranslation } from "react-i18next";

function Quizzes() {
  const { t, i18n } = useTranslation();
  const {
    getFiltredQuizzes,
    quizzes,
    loading,
    getQuizzes,
    putQuiz,
    getQuizWords,
    getRandomFlipCard,
  } = useQuiz();
  const { userLanguages, loadingUserLanguages } = useVocabulary();
  const [searchParams, setSearchParams] = useSearchParams();
  const language = searchParams.get("language");
  const active = language ? Number(language) : null;
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const previewQuizRef = useRef(null);
  const [quiz, setQuiz] = useState(null);
  const [loadingWords, setLoadingWords] = useState(false);
  const navigate = useNavigate();

  async function playRandomFlipCard() {
    try {
      const quiz = await getRandomFlipCard(language);
      navigate(
        `/my-quiz/${quiz.quiz_id}/flip-card-quiz?language=${language}&redirect=true`,
      );
    } catch (error) {
      toast.error(
        error.response?.detail ||
          t("ACTIVE_QUIZZES.FLASHCARDS_ERROR"),
      );
    }
  }

  async function openPreviewQuiz(id) {
    setQuiz(null);
    previewQuizRef.current?.showModal();
    setLoadingWords(true);

    try {
      const quizData = await getQuizWords(id);
      setQuiz(quizData);
    } catch (error) {
      console.error(error);
      toast.error(t("ACTIVE_QUIZZES.PREVIEW_ERROR"));
      setQuiz(null);
    } finally {
      setLoadingWords(false);
    }
  }

  function selectLanguage(languageId) {
    if (languageId === null) {
      setSearchParams({});
    } else {
      setSearchParams({ language: languageId });
    }
  }

  function openDialog() {
    setDialogOpen(true);
  }

  function closePreviewQuiz() {
    previewQuizRef.current?.close();
  }

  useEffect(() => {
    if (language) {
      getFiltredQuizzes(language);
    } else {
      getQuizzes();
    }
  }, [language]);

  async function handleEditQuiz(quizName) {
    const payload = {
      quiz_name: quizName,
    };

    try {
      await putQuiz(payload, selectedQuiz?.quiz_id);
      toast.success(t("ACTIVE_QUIZZES.EDIT_SUCCESS", { quizName }));
      setDialogOpen(false);
      getFiltredQuizzes(language);
    } catch (error) {
      const detail = error.response?.detail;
      const message = (Array.isArray(detail) ? detail[0] : detail) || t("ACTIVE_QUIZZES.EDIT_ERROR");
      setMessage(message);
      toast.error(message);
    }
  }

  return (
    <section className={styles["all-quizzes"]}>
      <header className={styles["topbar"]}>
        <div>
          <h1>{t("ACTIVE_QUIZZES.TITLE")}</h1>
          <p>
            {t("ACTIVE_QUIZZES.DESCRIPTION")}
          </p>
        </div>
      </header>

      <ul className={styles["languages-list"]}>
        <li
          className={`${styles["language-single"]} ${active === null ? styles["active"] : ""}`}
        >
          <button
            className={styles["language-button"]}
            onClick={() => selectLanguage(null)}
          >
            {t("ACTIVE_QUIZZES.ALL")}
          </button>
        </li>

        {loadingUserLanguages ? (
          <PreLoader />
        ) : (
          userLanguages.map((lang) => (
            <li
              key={lang.id}
              className={`${styles["language-single"]} ${active === lang.id ? styles["active"] : ""}`}
            >
              <button
                className={styles["language-button"]}
                onClick={() => selectLanguage(lang.id)}
              >
                {lang.language_name}
              </button>
            </li>
          ))
        )}
      </ul>

      {/* Quiz */}
      <div className={styles["category"]}>
        {loading ? (
          <div className="show-container">
            <PreLoader label={t("LOGIN.LOADING")} />
          </div>
        ) : quizzes.length === 0 ? (
          <p className={styles["no-quiz"]}>{t("ACTIVE_QUIZZES.EMPTY")}</p>
        ) : (
          quizzes.map((quiz) => (
            <article className={styles["vocab-card"]} key={quiz.quiz_id}>
              <h3>{quiz.quiz_name}</h3>
              <Tooltip title={t("ACTIVE_QUIZZES.EDIT_TITLE")} placement="top" arrow>
                <button
                  type="button"
                  className={styles["edit"]}
                  onClick={() => {
                    setSelectedQuiz(quiz);
                    openDialog();
                  }}
                >
                  <img src="/assets/edit.svg" alt={t("ACTIVE_QUIZZES.EDIT_TITLE")} />
                </button>
              </Tooltip>

              <div className={styles["action-button"]}>
                <Tooltip title={t("ACTIVE_QUIZZES.LEARN")} placement="top" arrow>
                  <Link
                    className={styles["action-button__icon"]}
                    to={`/my-quiz/${quiz.quiz_id}/learn-quiz?language=${quiz?.target_language}&redirect=true`}
                  >
                    <img
                      width={40}
                      height={40}
                      src="/assets/learn-quiz.svg"
                      alt={t("ACTIVE_QUIZZES.LEARN")}
                    />
                  </Link>
                </Tooltip>
                <Tooltip title={t("ACTIVE_QUIZZES.TEST")} placement="top" arrow>
                  <Link
                    className={styles["action-button__icon"]}
                    to={`/my-quiz/${quiz.quiz_id}/play-quiz?language=${quiz?.target_language}&redirect=true`}
                  >
                    <img
                      width={40}
                      height={40}
                      src="/assets/write.svg"
                      alt={t("ACTIVE_QUIZZES.TEST")}
                    />
                  </Link>
                </Tooltip>

                <Tooltip title={t("ACTIVE_QUIZZES.PREVIEW")} placement="top" arrow>
                  <button
                    type="button"
                    onClick={() => openPreviewQuiz(quiz.quiz_id)}
                    className={styles["action-button__icon"]}
                  >
                    <img
                      width={40}
                      height={40}
                      src="/assets/preview-quiz.svg"
                      alt={t("ACTIVE_QUIZZES.PREVIEW")}
                    />
                  </button>
                </Tooltip>
                {/* Flip Card */}
                <Tooltip title={t("ACTIVE_QUIZZES.FLASHCARDS")} placement="top" arrow>
                  <Link
                    className={styles["action-button__icon"]}
                    to={`/my-quiz/${quiz.quiz_id}/flip-card-quiz?language=${quiz?.target_language}&redirect=true`}
                  >
                    <img
                      width={40}
                      height={40}
                      src="/assets/flip-card.svg"
                      alt={t("ACTIVE_QUIZZES.FLASHCARDS")}
                    />
                  </Link>
                </Tooltip>
                {/* Flip Card end*/}
              </div>

              <div className={styles["action-button"]}>
                {/* Audio loop */}
                <Tooltip title={t("ACTIVE_QUIZZES.AUDIO")} placement="bottom" arrow>
                  <Link
                    className={styles["action-button__icon"]}
                    to={`/my-quiz/${quiz.quiz_id}/word-audio-loop?language=${quiz?.target_language}&redirect=true`}
                  >
                    <img
                      width={40}
                      height={40}
                      src="/assets/repead.svg"
                      alt={t("ACTIVE_QUIZZES.AUDIO")}
                    />
                  </Link>
                </Tooltip>
                {/* Audio loop end*/}
                {/* HEAR Card */}
                <Tooltip title={t("ACTIVE_QUIZZES.LISTEN")} placement="bottom" arrow>
                  <Link
                    className={styles["action-button__icon"]}
                    to={`/my-quiz/${quiz.quiz_id}/hear-quiz?language=${quiz?.target_language}&redirect=true`}
                  >
                    <img
                      width={40}
                      height={40}
                      src="/assets/hear.svg"
                      alt={t("ACTIVE_QUIZZES.LISTEN")}
                    />
                  </Link>
                </Tooltip>
                {/* HEAR Card end*/}

                {/* Flip Card */}
                <Tooltip title={t("ACTIVE_QUIZZES.FLASHCARDS_REVERSE")} placement="top" arrow>
                  <Link
                    className={styles["action-button__icon"]}
                    to={`/my-quiz/${quiz.quiz_id}/flip-card-quiz-reverse?language=${quiz?.target_language}&redirect=true`}
                  >
                    <img
                      width={40}
                      height={40}
                      src="/assets/flip-card-reverse.svg"
                      alt={t("ACTIVE_QUIZZES.FLASHCARDS_REVERSE")}
                    />
                  </Link>
                </Tooltip>
                {/* Flip Card end*/}

                {/* Audio loop reverse */}
                <Tooltip title={t("ACTIVE_QUIZZES.AUDIO_REVERSE")} placement="bottom" arrow>
                  <Link
                    className={styles["action-button__icon"]}
                    to={`/my-quiz/${quiz.quiz_id}/word-audio-loop-reverse?language=${quiz?.target_language}&redirect=true`}
                  >
                    <img
                      width={40}
                      height={40}
                      src="/assets/repead-reverse.svg"
                      alt={t("ACTIVE_QUIZZES.AUDIO_REVERSE")}
                    />
                  </Link>
                </Tooltip>
                {/* Audio loop reverse end*/}
              </div>
              
              {/* Multiple choice */}
              <div className={styles["action-button"]}>
                <Tooltip title={t("ACTIVE_QUIZZES.MULTIPLE_CHOICE")} placement="top" arrow>
                  <Link
                    className={styles["action-button__icon"]}
                    to={`/my-quiz/${quiz.quiz_id}/multiple-choice-quiz?language=${quiz?.target_language}&redirect=true`}
                  >
                    <img
                      width={40}
                      height={40}
                      src="/assets/multiple-choice.svg"
                      alt={t("ACTIVE_QUIZZES.MULTIPLE_CHOICE")}
                    />
                  </Link>
                </Tooltip>
              </div>
              {/* Multiple choice end*/}

              <div className={styles["vocab-card__footer"]}>
                <Link
                  to={`/my-quiz/${quiz.quiz_id}/all-quiz-words?language=${quiz?.target_language}`}
                  className={styles["vocab-card__meta"]}
                >
                  <span>▦</span>
                  <strong>{t("ACTIVE_QUIZZES.WORD_COUNT", { count: quiz.concepts_count })}</strong>
                </Link>

                <div className={styles["vocab-card__updated"]}>
                  <span>{t("ACTIVE_QUIZZES.CREATED")}</span>
                  <strong>
                    {new Date(quiz.created_at).toLocaleDateString(i18n.resolvedLanguage, {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </strong>
                </div>
              </div>
            </article>
          ))
        )}

        {/* Quiz END */}
      </div>
      <div className={styles["cards"]}>
        <div className={`${styles["card"]} ${styles["mastery"]}`}>
          <h3>{t("ACTIVE_QUIZZES.RANDOM_TITLE")}</h3>
          <p>{t("ACTIVE_QUIZZES.RANDOM_DESCRIPTION")}</p>
          <button type="button" onClick={playRandomFlipCard} disabled={loading}>
            {t("ACTIVE_QUIZZES.START")}
          </button>
        </div>

        <PlayLastQuiz redirect />
      </div>

      <FormDialog
        quizName={selectedQuiz?.quiz_name}
        dialogTitle={t("ACTIVE_QUIZZES.EDIT_TITLE")}
        dialogDescription={t("ACTIVE_QUIZZES.EDIT_DESCRIPTION")}
        inputLabel={t("ACTIVE_QUIZZES.QUIZ_NAME")}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        message={message}
        onSubmit={handleEditQuiz}
      />

      {/* PREVIEW */}
      <dialog
        ref={previewQuizRef}
        className={styles["preview-quiz"]}
        aria-labelledby="preview-quiz-title"
      >
        <button
          type="button"
          onClick={closePreviewQuiz}
          aria-label={t("ACTIVE_QUIZZES.CLOSE_PREVIEW")}
          className={styles["preview-quiz__close"]}
        >
          <img width={25} height={25} src="/assets/xbox.svg" alt="" />
        </button>
        <div className={styles["preview-quiz__list"]}>
          <div className={styles["preview-quiz__head"]}>
            <h2 id="preview-quiz-title">{t("YOUR_VOCABULARY.WORD_TRANSLATION")}</h2>
            <div className={styles["preview-quiz__actions"]}>{t("YOUR_VOCABULARY.ACTIONS")}</div>
          </div>

          {loadingWords ? (
            <div className="show-container">
              <PreLoader label={t("LOGIN.LOADING")} />
            </div>
          ) : (
            quiz?.concepts?.map((concept) => (
              <div className={styles["preview-quiz__row"]} key={concept.id}>
                <div className={styles["preview-quiz__word"]}>
                  <h3>{concept.translations[0].word}</h3>
                  <span>»</span>
                  <p>{concept.translations[1].word}</p>
                </div>

                <div className={styles["preview-quiz__actions"]}>
                  <Link
                    aria-label={t("ACTIVE_QUIZZES.EDIT_WORD")}
                    onClick={closePreviewQuiz}
                    to={`/my-quiz/${concept.id}/edit-word?target-word=${concept.translations[1].id}&language=${concept.translations[1].language}`}
                  >
                    <img src="/assets/edit.svg" alt="" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </dialog>
      {/* PREVIEW Ende*/}
    </section>
  );
}

export default Quizzes;
