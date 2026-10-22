import { useCallback, useEffect, useState } from "react";
import useApi from "../api/useApi.js";
import useApiFetch from "../api/useApiFetch.js";

import VocabularyContext from "./VocabularyContext.jsx";

export function VocabularyProvider({ children, api: apiOverride, apiFetch: fetchOverride, request, onError = console.error, onLanguagesLoaded, speak }) {
  const contextApi = useApi();
  const api = apiOverride ?? contextApi;
  const defaultFetch = useApiFetch(request, api);
  const apiFetch = fetchOverride ?? defaultFetch;
  const [words, setWords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userLanguages, setUserLanguages] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [nativeLanguage, setNativeLanguage] = useState([]);

  const [loading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [speakActive, setSpeakActive] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState(null);

  async function getConcepts(page = 1) {
    setLoading(true);
    try {
      const response = await apiFetch(`${api}concepts/?page=${page}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load words.");
      }

      const data = await response.json();
      setWords(data);

      setNextPage(data.next);
      setPreviousPage(data.previous);
    } catch (error) {
      console.error(error);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const getRandomRepeatWords = useCallback(async (language, { signal } = {}) => {
    const params = new URLSearchParams({ language });
    const response = await apiFetch(`${api}random-repeat-words/?${params}`, {
      credentials: "include",
      signal,
    });
    if (!response.ok) throw new Error("ZufÃ¤llige WÃ¶rter konnten nicht geladen werden.");
    return await response.json();
  }, [api, apiFetch]);

  const searchVocabulary = useCallback(
    async (search, { signal } = {}) => {
      const query = search.trim();
      if (!query) return [];

      const params = new URLSearchParams({ search: query });
      const response = await apiFetch(
        `${api}vocabulary-search/?${params}`,
        { credentials: "include", signal },
      );

      if (!response.ok) {
        throw new Error("Die Vokabelsuche ist fehlgeschlagen.");
      }

      const data = await response.json();
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.results)) return data.results;
      throw new Error("Die Vokabelsuche hat ein ungÃ¼ltiges Ergebnis geliefert.");
    },
    [api, apiFetch],
  );

  const getCategoryWords = useCallback(async (id, page = 1) => {
    setLoading(true);
    try {
      const response = await apiFetch(`${api}categories/${id}/?page=${page}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        const error = new Error("Failed to get category words.");
        error.response = data;
        throw error;
      }

      return data;
    } finally {
      setLoading(false);
    }
  }, [api, apiFetch]);

  async function getCategory(id) {
    setLoading(true);

    try {
      const response = await apiFetch(`${api}categories/${id}/`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to load category.");
      }

      return data;
    } finally {
      setLoading(false);
    }
  }

  async function getUserLanguages() {
    const response = await apiFetch(`${api}user-languages/`, {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to load languages.");
    }

    setUserLanguages(data.learning_languages);

    return data;
  }

  async function getLanguages() {
    const response = await apiFetch(`${api}languages/`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to load languages.");
    }
    return await response.json();
  }

  async function postLanguages(payload) {
    const response = await apiFetch(`${api}user-languages/`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to load languages.");
    }
    return await response.json();
  }

  async function getCategories() {
    setLoading(true);
    try {
      const response = await apiFetch(`${api}categories/`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load catgories.");
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const getFiltredCategories = useCallback(async (id) => {

    try {
      const response = await apiFetch(
        `${api}categories/?target_language=${id}`,
        {
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to load words.");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
      onError(error.message);
    }
  }, [api, apiFetch, onError]);


  const getConcept = useCallback(
    async (id, languageId) => {
      const response = await apiFetch(
        `${api}concepts/${id}/?language=${languageId}`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Word not found.");
      }

      return await response.json();
    },
    [api, apiFetch],
  );

  async function getDateFilteredConcepts(language, date, page = 1) {
    const params = new URLSearchParams({ created_at__date: date, page });
    if (language) params.set("language", language);
    setLoading(true);

    try {
      const response = await apiFetch(`${api}words/?${params}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load words.");
      const data = await response.json();
      const results = await Promise.all(
        data.results.map(async (word) => {
          const concept = await getConcept(word.concept, word.language);
          const translations = concept.translations ?? [];
          const source = translations.find(
            (item) => item.language !== word.language,
          );
          const target = translations.find((item) => item.id === word.id);
          return {
            ...concept,
            id: word.concept,
            translations: [source ?? { word: "â€”" }, { ...target, ...word }],
          };
        }),
      );
      setWords({ ...data, results });
      setNextPage(data.next);
      setPreviousPage(data.previous);
    } catch (error) {
      console.error(error);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function getFiltredConcepts(id, page = 1) {
    setLoading(true);

    try {
      const response = await apiFetch(
        `${api}concepts/?language=${id}&page=${page}`,
        {
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to load words.");
      }
      const data = await response.json();
      
      setWords(data);
      setNextPage(data.next);
      setPreviousPage(data.previous);
    } catch (error) {
      console.error(error);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createConcept(conceptData) {
    const response = await apiFetch(`${api}concepts/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conceptData),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error("Failed to create concept");
      error.response = data;
      throw error;
    }

    return data;
  }

  async function createCategory(categoryData) {
    const response = await apiFetch(`${api}categories/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error("Failed to create concept");
      error.response = data;
      throw error;
    }

    return data;
  }

  async function updateWord(id, wordData) {
    const response = await apiFetch(`${api}concepts/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(wordData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  }

  async function updateCategory(id, categoryData) {
    const response = await apiFetch(`${api}categories/${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    const updatedCategory = await response.json();

    return updatedCategory;
  }

  async function deleteWord(id) {
    await apiFetch(`${api}words/${id}/`, {
      method: "DELETE",
    });
  }

  async function deleteCategory(id) {
    await apiFetch(`${api}categories/${id}/`, {
      method: "DELETE",
    });
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      try {
        const [userData, languages] = await Promise.all([
          getUserLanguages(),
          getLanguages(),
        ]);

        setLanguages(languages);
        setNativeLanguage(userData.native_language);
        setUserLanguages(userData.learning_languages);

        onLanguagesLoaded?.(userData);
        if (!userData.languages_active) return;

        await getConcepts();
      } catch (error) {
        console.error(error);
      onError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    // Initialize once per authenticated mount; rerenders must not repeat navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearCategories = useCallback(() => {
    setCategories([]);
  }, []);

  function speakWord(word, language_code, speechId = null) {
    speak?.(word, language_code, {
      onStart: () => { setSpeakActive(true); setActiveSpeechId(speechId); },
      onEnd: () => { setSpeakActive(false); setActiveSpeechId(null); },
    });
  }

  return (
    <VocabularyContext.Provider
      value={{
        words,
        categories,
        loading,
        languages,
        userLanguages,
        nativeLanguage,
        nextPage,
        previousPage,
        speakActive,
        activeSpeechId,
        postLanguages,

        getConcepts,
        searchVocabulary,
        getRandomRepeatWords,
        clearCategories,
        getUserLanguages,
        getConcept,
        getFiltredConcepts,
        getDateFilteredConcepts,
        getFiltredCategories,
        createConcept,
        updateWord,
        updateCategory,
        deleteCategory,
        deleteWord,
        getCategory,
        getCategoryWords,
        getCategories,
        createCategory,
        speakWord,
      }}
    >
      {children}
    </VocabularyContext.Provider>
  );
}
