import { createContext, useEffect, useState } from "react";
import useApi from "./ApiContext";
import { useNavigate } from "react-router-dom";

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

  async function getConcepts(page = 1) {
    setLoading(true);
    try {
      const response = await fetch(`${api}concepts/?page=${page}`, {
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
      const response = await fetch(`${api}categories/${id}/`, {
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
    const response = await fetch(`${api}user-languages/`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to load languages.");
    }

    setUserLanguages(data.learning_languages);

    return data;
  }

  async function getLanguages() {
    const response = await fetch(`${api}languages/`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load languages.");
    }
    return await response.json();
  }

  async function postLanguages(payload) {
    const response = await fetch(`${api}user-languages/`, {
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

  async function getCategories(id) {
    setLoading(true);
    try {
      const response = await fetch(`${api}categories/?target_language=${id}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load catgories.");
      }

      const data = await response.json();
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function getFiltredCategories(id) {
    try {
      const response = await fetch(`${api}categories/?target_language=${id}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to load words.");
      }
      const data = await response.json();
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function getConcept(id, languageId) {
    const response = await fetch(
      `${api}concepts/${id}/?language=${languageId}`,
      {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Word not found.");
    }

    return await response.json();
  }

  async function getFiltredConcepts(id, page = 1) {
    setLoading(true);

    try {
      const response = await fetch(
        `${api}concepts/?language=${id}&page=${page}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
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
    const response = await fetch(`${api}concepts/`, {
      method: "POST",
      credentials: "include",
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
    const response = await fetch(`${api}categories/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    const newCategory = await response.json();

    return newCategory;
  }

  async function updateWord(id, wordData) {
    const response = await fetch(`${api}concepts/${id}/`, {
      method: "PATCH",
      credentials: "include",
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
    const response = await fetch(`${api}categories/${id}/`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    const updatedCategory = await response.json();

    return updatedCategory;
  }

  async function deleteWord(id) {
    await fetch(`${api}words/${id}/`, {
      method: "DELETE",
      credentials: "include",
    });
  }

  async function deleteCategory(id) {
    await fetch(`${api}categories/${id}/`, {
      method: "DELETE",
      credentials: "include",
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

        if (!userData.languages_active) {
          navigate("/my-quiz/choose-languages");
        }

        setLanguages(languages);
        setNativeLanguage(userData.native_language);
        setUserLanguages(userData.learning_languages);

        await getConcepts();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function clearCategories() {
    setCategories([]);
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
      }}
    >
      {children}
    </VocabularyContext.Provider>
  );
}
