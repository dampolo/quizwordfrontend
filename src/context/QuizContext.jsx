import { createContext, useState } from "react";
import useApi from "./ApiContext";

const QuizContext = createContext();

export default QuizContext;

export function QuizProvider({ children }) {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState([]);

  async function getQuizzes() {
    setLoading(true);

    try {
      const response = await fetch(`${api}quizzes/`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load quizzes.");
      }

      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function getFiltredQuizzes(id) {
    try {
      const response = await fetch(`${api}quizzes/?target_language=${id}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to load words.");
      }
      const data = await response.json();
      setQuizzes(data);

      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function createQuiz(quizData) {
    const response = await fetch(`${api}quizzes/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizData),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error("Failed to create concept");
      error.response = data;
      throw error;
    }

    return data;
  }

  async function postQuizAnswers(id, payload) {
    const response = await fetch(`${api}quiz-answers/${id}/submit/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Quiz submission failed");
    }

    return data;
  }

  async function getQuizWords(id) {
    setLoading(true);

    try {
      const response = await fetch(`${api}quizzes/${id}`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error("Failed to get quiz");
        error.response = data;
        throw error;
      }

      return data;
    } finally {
      setLoading(false);
    }
  }

  async function getLastQuiz() {
    setLoading(true);

    try {
      const response = await fetch(`${api}last-quiz/`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error("Failed to get last quiz");
        error.response = data;
        throw error;
      }

      return data;
    } finally {
      setLoading(false);
    }
  }

  async function deleteQuiz(id) {
    const response = await fetch(`${api}quizzes/${id}/`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to delete quiz");
    }
  }

  async function getAttemptQuizScore(id) {
    setLoading(true);

    try {
      const response = await fetch(`${api}attempts/?quiz_id=${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load words.");
      }

      const data = await response.json();

      return data;
    } finally {
      setLoading(false);
    }
  }

  async function getAttemptDetails(id) {
    setLoading(true);

    try {
      const response = await fetch(`${api}attempts/${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load words.");
      }

      const data = await response.json();

      return data;
    } finally {
      setLoading(false);
    }
  }

  return (
    <QuizContext.Provider
      value={{
        loading,
        quizzes,
        createQuiz,
        deleteQuiz,
        getQuizWords,
        getQuizzes,
        getLastQuiz,
        getFiltredQuizzes,
        getAttemptQuizScore,
        getAttemptDetails,
        postQuizAnswers,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}
