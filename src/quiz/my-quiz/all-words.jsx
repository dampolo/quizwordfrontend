import "./all-words.scss";
import useVocabulary from "../../context/useVocabulary";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import FormDialog from "../../components/FormDialog/FormDialog";
import useQuiz from "../../context/useQuiz";
import PreLoader from "../../components/PreLoader/PreLoader";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

function AllWords() {
  const {
    words,
    loading,
    userLanguages,
    getFiltredConcepts,
    nextPage,
    previousPage,
    getConcepts,
  } = useVocabulary();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedWordIds, setSelectedWordIds] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { createQuiz } = useQuiz();
  const [currentPage, setCurrentPage] = useState(1);

  const language = searchParams.get("language");
  const active = language ? Number(language) : null;
  const navigate = useNavigate();

  function handleCheckboxChange(id, checked) {
    setSelectedWordIds((prev) => {
      if (checked) {
        return [...prev, id];
      }
      return prev.filter((item) => item !== id);
    });
  }

  function openDialog() {
    setDialogOpen(true);
  }

  async function handleCreateQuiz(quizName) {
    const payload = {
      quiz_name: quizName,
      concepts: selectedWordIds,
      target_language: language,
    };

    try {
      await createQuiz(payload);
      toast.success(`Quiz "${quizName}" wurde erstellt!`);
      setDialogOpen(false);
      setSelectedWordIds([]);
      navigate(`/my-quiz/all-words/?language=${language}`);
    } catch (error) {
      console.error("Failed to create quiz:", error);
    }
  }

  function selectLanguage(languageId) {
    setSelectedWordIds([]);
    setSearchParams({ language: languageId });
  }

  useEffect(() => {
    if (language) {
      getFiltredConcepts(language, currentPage);
    } else {
      getConcepts(currentPage);
    }
  }, [language, currentPage]);

  if (loading) {
    return (
      <div className="show-container ">
        <PreLoader />
      </div>
    );
  }

  return (
    <div className="vocabulary">
      <div className="vocabulary__header">
        <div>
          <h1>Deine Vokabeln</h1>
          <p>
            Organisiere und verfolge deinen Lernfortschritt. Verwalte
            Übersetzungen, Kategorien und Wiederholungspläne für alle deine
            gespeicherten Ausdrücke.
          </p>
        </div>

        <div className="create-buttons">
          <button
            type="submit"
            onClick={openDialog}
            className="main-quiz-button create-quiz"
            disabled={selectedWordIds.length < 3}
          >
            + Quiz
          </button>

          <Link className="main-quiz-button add-btn" to="/my-quiz/add-new-word">
            + Wort
          </Link>
        </div>
      </div>

      <ul className="languages-list">
        {userLanguages?.map((lang) => (
          <li
            className={
              active === lang.id ? "language-single active" : "language-single"
            }
            key={lang.id}
          >
            <button
              className="language-button"
              onClick={() => selectLanguage(lang.id)}
            >
              {lang.language_name}
            </button>
          </li>
        ))}
      </ul>

      <div className="word-list">
        <div className="list-head">
          <div className="check">+</div>
          <div className="rank">Rang</div>
          <div className="word">Wort & Übersetzung</div>
          <div className="category">Kategorie</div>
          <div className="streak">Serie</div>
          <div className="actions">Aktionen</div>
        </div>
        {words?.results?.length === 0 ? (
          <p className="no-words">Du hast hier keine Wörter.</p>
        ) : (
          words?.results?.map((word) => (
            <div className="list-row" key={word.id}>
              <div className="checkbox">
                <input
                  type="checkbox"
                  checked={selectedWordIds.includes(word.id)}
                  onChange={(e) =>
                    handleCheckboxChange(word.id, e.target.checked)
                  }
                />
              </div>

              <div className="rank">#{word.target_rank}</div>

              <div className="word">
                <h3>{word.translations[0].word}</h3>
                <span>»</span>
                <p>{word.translations[1].word}</p>
              </div>

              <div className="category">
                <span className={`badge ${word.category_name}`}>
                  {word.translations[1].category_name}
                </span>
              </div>

              <div className="streak">
                🔥
                <strong>{word.streak}</strong>
                <span>Days</span>
              </div>

              <div className="actions">
                <Link
                  to={`/my-quiz/${word.id}/edit-word?target-word=${word.translations[1].id}&language=${word.translations[1].language}`}
                >
                  ✏️
                </Link>
              </div>
            </div>
          ))
        )}

        <div className="pagination">
          <span>{words?.count} Wörter</span>

          <div className="pages">
            <button
              type="button"
              className="main-quiz-button btn-pagination"
              disabled={!previousPage}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              &lt;
            </button>
            {currentPage}
            <button
              className="main-quiz-button btn-pagination"
              disabled={!nextPage}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      <div className="cards">
        <div className="card goal">
          <h3>Today's Goal</h3>
          <p>Review 20 new words to keep your streak alive.</p>

          <div className="progress">
            <div className="progress-fill"></div>
          </div>

          <small>12 / 20 Words • 60%</small>
        </div>

        <div className="card mastery">
          <h3>Mastery Level</h3>
          <p>You've reached B2 fluency level in Vocabulary.</p>
        </div>

        <div className="card review">
          <h3>Flashcard Review</h3>
          <p>Ready to test your memory on recent additions?</p>

          <button>Start Review Session</button>
        </div>
      </div>
      <FormDialog
        open={dialogOpen}
        selectedWordsCount={selectedWordIds.length}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateQuiz}
      />
    </div>
  );
}

export default AllWords;
