import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import useVocabulary from "../../context/vocabulary/useVocabulary";
import { useAuth } from "../../context/auth/useAuth";
import styles from "./Search.module.scss";

function Search() {
  const { t } = useTranslation();
  const { userLanguages, languages, searchVocabulary } = useVocabulary();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const query = searchTerm.trim();
  const [searchState, setSearchState] = useState({
    query: "",
    results: [],
    loading: false,
    error: "",
  });
  const searchResults =
    query && searchState.query === query ? searchState.results : [];
  const searchLoading =
    Boolean(query) && (searchState.query !== query || searchState.loading);
  const searchError = searchState.query === query ? searchState.error : "";

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(async () => {
      setSearchState({ query, results: [], loading: true, error: "" });
      setCurrentIndex(-1);
      try {
        const results = await searchVocabulary(query, {
          signal: controller.signal,
        });
        if (active) {
          setSearchState({ query, results, loading: false, error: "" });
        }
      } catch (error) {
        if (active && error.name !== "AbortError") {
          setSearchState({
            query,
            results: [],
            loading: false,
            error: error.message || true,
          });
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, searchVocabulary, user?.is_superuser]);

  function openSearchResult(word) {
    const targetLanguage = [
      ...(userLanguages ?? []),
      ...(languages ?? []),
    ].find(
      (item) =>
        item.language_name?.toLocaleLowerCase() ===
        word.target_language?.toLocaleLowerCase(),
    );
    if (!targetLanguage) {
      toast.error(
        t("VOCABULARY_SEARCH.LANGUAGE_ERROR"),
      );
      return;
    }
    setIsResultsVisible(false);
    navigate(
      `/my-quiz/${word.concept_id}/show-word?language=${targetLanguage.id}`,
    );
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Escape") {
      setIsResultsVisible(false);
      setCurrentIndex(-1);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsResultsVisible(true);
      if (!searchResults.length) return;
      setCurrentIndex((index) => {
        const lastIndex = searchResults.length - 1;
        if (index < 0) return event.key === "ArrowDown" ? 0 : lastIndex;
        return event.key === "ArrowDown"
          ? (index + 1) % searchResults.length
          : (index - 1 + searchResults.length) % searchResults.length;
      });
    }
  }

  return (
    <search
      className={styles["search-container"]}
      aria-label={t("VOCABULARY_SEARCH.TITLE")}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsResultsVisible(false);
          setCurrentIndex(-1);
        }
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const result = searchResults[currentIndex] ?? searchResults[0];
          if (result) openSearchResult(result);
          else setIsResultsVisible(true);
        }}
      >
        <label
          htmlFor="vocabulary-search"
          className={styles["visually-hidden"]}
        >
          {t("VOCABULARY_SEARCH.PROMPT")}
        </label>
        <button
          className={styles["search-btn"]}
          type="submit"
          aria-label={t("VOCABULARY_SEARCH.SUBMIT")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="7" />
            <path d="m15 15 6 6" />
          </svg>
        </button>
        <input
          ref={searchInputRef}
          type="search"
          id="vocabulary-search"
          name="search"
          placeholder={t("VOCABULARY_SEARCH.PROMPT")}
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentIndex(-1);
            setIsResultsVisible(true);
          }}
          onFocus={() => setIsResultsVisible(true)}
          onKeyDown={handleSearchKeyDown}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isResultsVisible}
          aria-controls="vocabulary-search-results"
          aria-activedescendant={
            isResultsVisible && searchResults[currentIndex]
              ? `vocabulary-result-${currentIndex}`
              : undefined
          }
        />
        {searchTerm !== "" && (
          <button
            className={styles["close-btn"]}
            type="button"
            aria-label={t("VOCABULARY_SEARCH.CLEAR")}
            onClick={() => {
              setSearchTerm("");
              setCurrentIndex(-1);
              searchInputRef.current?.focus();
            }}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </form>
      <div
        className={styles["show-found"]}
        hidden={!isResultsVisible || !query}
      >
        <p className={styles["search-hint"]} role="status">
          {searchLoading
            ? t("VOCABULARY_SEARCH.LOADING")
            : searchError
              ? (searchError === true ? t("VOCABULARY_SEARCH.ERROR") : searchError)
              : searchResults.length === 0
                ? t("VOCABULARY_SEARCH.EMPTY")
                : t("VOCABULARY_SEARCH.MATCHES", { count: searchResults.length, query: searchTerm })}
        </p>
        <ul
          id="vocabulary-search-results"
          role="listbox"
          aria-label={t("VOCABULARY_SEARCH.RESULTS")}
        >
          {searchResults.map((word, index) => (
            <li
              key={`${word.concept_id}-${word.target_language}-${word.target_word}`}
              id={`vocabulary-result-${index}`}
              role="option"
              aria-selected={index === currentIndex}
            >
              <button
                type="button"
                tabIndex={-1}
                className={
                  index === currentIndex
                    ? styles["selected-result"]
                    : undefined
                }
                onClick={() => openSearchResult(word)}
              >
                {word.native_word} » {word.target_word}
                <small>
                  {" "}
                  ({word.native_language} → {word.target_language})
                </small>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </search>
  );
}

export default Search;
