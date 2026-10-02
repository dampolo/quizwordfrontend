import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import useVocabulary from "../../../context/useVocabulary";
import BackButton from "../../../components/BackButton/BackButton";
import PreLoader from "../../../components/PreLoader/PreLoader";
import styles from "./show-word.module.scss";

export default function ShowWord() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { getConcept, languages } = useVocabulary();
  const languageId = searchParams.get("language");
  const [formData, setFormData] = useState(null);
  const [wordLoaded, setWordLoaded] = useState(false);

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
      <BackButton to={`/my-quiz/all-words?language=${languageId}`} />

      <h1>Wort ansehen</h1>

      {!wordLoaded ? (
        <PreLoader />
      ) : (
        <div className={styles["word-grid"]}>
          {formData?.translations?.[0] && (
            <article className={styles["word-card"]}>
              <header className={styles["word-header"]}>
                <p className={styles.language}>
                  {languages.find(
                    (language) =>
                      String(language.id) ===
                      String(formData.translations[0].language),
                  )?.language_name || "Übersetzung"}
                </p>

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
                <p className={styles.language}>
                  {languages.find(
                    (language) =>
                      String(language.id) ===
                      String(formData.translations[1].language),
                  )?.language_name || "Übersetzung"}
                </p>

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
    </section>
  );
}
