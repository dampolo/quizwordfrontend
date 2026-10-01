import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import useVocabulary from "../../../context/useVocabulary";
import BackButton from "../../../components/BackButton/BackButton";
import PreLoader from "../../../components/PreLoader/PreLoader";
import styles from "./show-word.module.scss";

export default function ShowWord() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { getConcept, languages } = useVocabulary();
  const languageId = searchParams.get("language");
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function loadWord() {
      try {
        const concept = await getConcept(id, languageId);
        setResult({ id, languageId, concept });
      } catch (err) {
        console.error(err);
      }
    }

    loadWord();
  }, [id, languageId, getConcept]);

  const currentResult =
    result?.id === id && result?.languageId === languageId ? result : null;
  const translations = currentResult?.concept?.translations || [];

  return (
    <section className={styles["show-word-page"]}>
      <BackButton to={`/my-quiz/all-words?language=${languageId}`} />
      <h1>Wort ansehen</h1>
      {!currentResult ? (
        <PreLoader />
      ) : (
        <div className={styles["word-grid"]}>
          {translations.map((translation) => (
            <article className={styles["word-card"]} key={translation.id}>
              <p className={styles.language}>
                {languages.find(
                  (language) =>
                    String(language.id) === String(translation.language),
                )?.language_name || "Übersetzung"}
              </p>
              <h2>{translation.word}</h2>
                <div>
                  <h3>Tipp</h3>
                  <p>{translation.tip || "---" }</p>
                </div>
                <div>
                  <h3>Beispielsatz</h3>
                  <p>{translation.sentence || "---"}</p>
                </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
