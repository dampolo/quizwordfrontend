import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useParams } from "react-router-dom";
import useVocabulary from "../../../context/vocabulary/useVocabulary";
import BackButton from "../../../components/BackButton/BackButton";
import PageTitle from "../../../components/PageTitle/PageTitle";
import PreLoader from "../../../components/PreLoader/PreLoader";
import styles from "./all-category-words.module.scss";

export default function AllCategoryWords() {
  const { getCategoryWords, loading } = useVocabulary();
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ categoryId: id, page: 1 });
  const currentPage = pagination.categoryId === id ? pagination.page : 1;
  const concepts = category?.concepts ?? [];
  const previousPage = category?.previous;
  const nextPage = category?.next;

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setError("");
        const category = await getCategoryWords(id, currentPage);
        if (active) setCategory(category);
      } catch (err) {
        if (!active) return;
        console.error(err);
        const message = "Die Wörter konnten nicht geladen werden.";
        toast.error(message);
        setError(message);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [id, currentPage, getCategoryWords]);

  if (loading) {
    return (
      <div className="show-container">
        <PreLoader />
      </div>
    );
  }

  return (
    <section className={styles["all-category-words"]}>
      <PageTitle title={category?.category_name ?? "Kategoriewörter"} />
      <BackButton
        to={`/my-quiz/all-categories?language=${category?.language_id}`}
      />
      <h1>Kategorie: {category?.category_name ?? "…"}</h1>
      {error ? (
        <p role="alert">{error}</p>
      ) : !category?.concepts?.length ? (
        <p>Du hast in dieser Kategorie noch keine Wörter.</p>
      ) : (
        <div className={styles["word-list"]}>
          <div className={styles["list-head"]}>
            <div>Rang</div>
            <div>Wort & Übersetzung</div>
            <div className={styles["category"]}>Kategorie</div>
            <div className={styles["streak"]}>Serie</div>
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
                <div className={styles["category"]}><span className={styles["badge"]}>{target?.category_name ?? category.category_name}</span></div>
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
          <div className={styles["pagination"]}>
            <span>{category?.count ?? 0} Wörter</span>
            <div className={styles["pages"]}>
              <button
                type="button"
                className={`main-quiz-button ${styles["btn-pagination"]}`}
                disabled={!previousPage}
                onClick={() => setPagination({ categoryId: id, page: currentPage - 1 })}
              >
                &lt;
              </button>
              {currentPage}
              <button
                type="button"
                className={`main-quiz-button ${styles["btn-pagination"]}`}
                disabled={!nextPage}
                onClick={() => setPagination({ categoryId: id, page: currentPage + 1 })}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
