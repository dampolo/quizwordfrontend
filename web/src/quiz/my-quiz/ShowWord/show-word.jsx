import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import useVocabulary from "../../../context/vocabulary/useVocabulary";
import BackButton from "../../../components/BackButton/BackButton";
import EditButton from "../../../components/EditButton/EditButton";

import WordAudioLoop from "./WordAudioLoop/word-audio-loop";


import PreLoader from "../../../components/PreLoader/PreLoader";
import styles from "./show-word.module.scss";
import SpeakButton from "../../../components/SpeakButton/SpeakButton";
import RepeadButton from "../../../components/RepeadButton/RepeadButton";

export default function ShowWord() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { getConcept, speakWord, speakActive, activeSpeechId } =
    useVocabulary();
  const languageId = searchParams.get("language");
  const [formData, setFormData] = useState(null);
  const [wordLoaded, setWordLoaded] = useState(false);
  const audioDialogRef = useRef(null);
  const [audioOpen, setAudioOpen] = useState(false);
  const translations = formData?.translations;
  const target = translations?.[1];
  const returnParams = new URLSearchParams(searchParams);
  returnParams.delete("target-word");
  const editParams = new URLSearchParams(returnParams);
  if (target) {
    editParams.set("target-word", String(target.id));
    editParams.set("language", String(target.language));
  }
  const canRepeat = wordLoaded && Boolean(translations?.[0]?.word && translations?.[1]?.word);

  function openAudioDialog() {
    audioDialogRef.current.showModal();
    setAudioOpen(true);
  }

  function closeAudioDialog() {
    audioDialogRef.current.close();
  }



  useEffect(() => {
    async function loadWord() {
      setWordLoaded(false);
      try {
        const concept = await getConcept(id, languageId);
        setFormData(concept);
      } catch (err) {
        console.error(err);
        toast.error("Das Wort konnte nicht geladen werden.");
      } finally {
        setWordLoaded(true);
      }
    }

    loadWord();
  }, [id, languageId, getConcept]);

  return (
    <section className={styles["show-word-page"]}>
      <div className={styles["actions"]}>
        <BackButton
          to={`/my-quiz/all-words?${returnParams}`}
          className={styles["arrow-back"]}
        />

        <RepeadButton onClick={openAudioDialog} disabled={!canRepeat} />

        {target && <EditButton to={`/my-quiz/${id}/edit-word?${editParams}`} />}
      </div>

      <h1>Wort ansehen</h1>

      {!wordLoaded ? (
        <PreLoader />
      ) : (
        <div className={styles["word-grid"]}>
          {formData?.translations?.[0] && (
            <article className={styles["word-card"]}>
              <header className={styles["word-header"]}>
                <div className={styles["word-language"]}>
                  <p className={styles.language}>
                    {formData.translations[0].language_name}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      speakWord(
                        formData.translations[0].word,
                        formData.translations[0].language_code,
                        formData.translations[0].id,
                      )
                    }
                  >
                    <SpeakButton
                      speakActive={
                        speakActive &&
                        activeSpeechId === formData.translations[0].id
                      }
                    />
                  </button>
                </div>
                <h2>{formData.translations[0].word}</h2>
              </header>

              <div className={styles["word-detail"]}>
                <h3>Tipp</h3>
                <p>{formData.translations[0].tip || "---"}</p>
              </div>

              <div className={styles["word-detail"]}>
                <h3>Beispielsatz</h3>
                <p>{formData.translations[0].sentence || "---"}</p>
              </div>
            </article>
          )}

          {formData?.translations?.[1] && (
            <article className={styles["word-card"]}>
              <header className={styles["word-header"]}>
                <div className={styles["word-language"]}>
                  <p className={styles.language}>
                    {formData.translations[1].language_name}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      speakWord(
                        formData.translations[1].word,
                        formData?.translations[1].language_code,
                        formData.translations[1].id,
                      )
                    }
                  >
                    <SpeakButton
                      speakActive={
                        speakActive &&
                        activeSpeechId === formData.translations[1].id
                      }
                    />
                  </button>
                </div>

                <h2>{formData.translations[1].word}</h2>
              </header>

              <div className={styles["word-detail"]}>
                <h3>Tipp</h3>
                <p>{formData.translations[1].tip || "---"}</p>
              </div>

              <div className={styles["word-detail"]}>
                <h3>Beispielsatz</h3>
                <p>{formData.translations[1].sentence || "---"}</p>
              </div>
            </article>
          )}
        </div>
      )}

      <dialog
        ref={audioDialogRef}
        className={styles["audio-dialog"]}
        aria-labelledby="word-audio-title"
        onClose={() => setAudioOpen(false)}
      >
        {audioOpen && canRepeat && (
          <WordAudioLoop translations={translations} onClose={closeAudioDialog} />
        )}
      </dialog>
    </section>
  );
}
