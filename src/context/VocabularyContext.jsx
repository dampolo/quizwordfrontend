import { createContext, useCallback, useEffect, useState } from "react";
import useApi from "./ApiContext";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/apiFetch";

const VocabularyContext = createContext();

export default VocabularyContext;

export function VocabularyProvider({ children }) {
  const api = useApi();
  const navigate = useNavigate();
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
    } finally {
      setLoading(false);
    }
  }

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
    } finally {
      setLoading(false);
    }
  }

  async function getFiltredCategories(id) {
    setLoading(true);

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
      setLoading(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

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
    [api],
  );

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

        if (!userData.languages_active) {
          navigate("/my-quiz/choose-languages", {
            replace: true,
          });
          return;
        }

        const languageId = userData.learning_languages?.[0]?.id;

        navigate(`/my-quiz/all-words?language=${languageId}`, {
          replace: true,
        });

        await getConcepts();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const clearCategories = useCallback(() => {
    setCategories([]);
  }, []);

  function speakWord(word, language_code, speechId = null) {
    const speach = new SpeechSynthesisUtterance(word);
    speach.lang = language_code;
    speach.onstart = () => {
      setSpeakActive(true);
      setActiveSpeechId(speechId);
    };
    const resetSpeech = () => {
      setSpeakActive(false);
      setActiveSpeechId(null);
    };
    speach.onend = resetSpeech;
    speach.onerror = resetSpeech;
    window.speechSynthesis.speak(speach);
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
        clearCategories,
        getUserLanguages,
        getConcept,
        getFiltredConcepts,
        getFiltredCategories,
        createConcept,
        updateWord,
        updateCategory,
        deleteCategory,
        deleteWord,
        getCategory,
        getCategories,
        createCategory,
        speakWord,
      }}
    >
      {children}
    </VocabularyContext.Provider>
  );
}
