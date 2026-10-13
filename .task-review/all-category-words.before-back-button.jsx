import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useParams, useSearchParams } from "react-router-dom";
import useVocabulary from "../../../context/useVocabulary";
import BackButton from "../../../components/BackButton/BackButton";
import PageTitle from "../../../components/PageTitle/PageTitle";
import PreLoader from "../../../components/PreLoader/PreLoader";
import styles from "./all-category-words.module.scss";

export default function AllCategoryWords() {
  const { getCategoryWords } = useVocabulary();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const language = searchParams.get("language");
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const category = await getCategoryWords(id);
        setResult({ id, category });
        console.log({ id, category });
        
      } catch (err) {
        console.error(err);
        const message = "Die Wörter konnten nicht geladen werden.";
        toast.error(message);
        setResult({ id, error: message });
      }
    }

    loadData();
  }, [id, getCategoryWords]);

  const category = result?.id === id ? result.category : null;
  const concepts = category?.concepts ?? [];
  const backQuery = language ? `?${new URLSearchParams({ language })}` : "";

  return (
    <section className={styles["all-category-words"]}>
      <PageTitle title={category?.category_name ?? "Kategoriewörter"} />
      <BackButton to={`/my-quiz/all-categories${backQuery}`} />
      <h1>Kategorie: {category?.category_name ?? "…"}</h1>
      {result?.id !== id ? (
        <div className="show-container"><PreLoader /></div>
      ) : result.error ? (
        <p role="alert">{result.error}</p>
      ) : concepts.length === 0 ? (
        <p>Du hast in dieser Kategorie noch keine Wörter.</p>
      ) : (
        <div className={styles["word-list"]}>
          <div className={styles["list-head"]}>
            <div>Rang</div>
            <div>Wort & Übersetzung</div>
            <div>Kategorie</div>
            <div>Serie</div>
            <div>Aktionen</div>
          </div>
          {concepts.map((concept) => {
            const [source, target] = concept.translations ?? [];
            return (
              <div className={styles["list-row"]} key={concept.id}>
                <div className={styles["rank"]}>#{target?.rank ?? "—"}</div>
                <div className={styles["word"]}>
                  <h3>{source?.word ?? "—"}</h3>
                  <span>»</span>
                  <p>{target?.word ?? "—"}</p>
                </div>
                <div><span className={styles["badge"]}>{target?.category_name ?? category.category_name}</span></div>
                <div className={styles["streak"]}>🔥 <strong>{target?.streak ?? 0}</strong> <span>Days</span></div>
                <div className={styles["actions"]}>
                  {target && (
                    <Link to={`/my-quiz/${concept.id}/edit-word?target-word=${target.id}&language=${target.language}`}>
                      <img src="/assets/edit.svg" alt="Wort bearbeiten" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
