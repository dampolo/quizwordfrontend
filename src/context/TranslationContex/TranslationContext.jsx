import { createContext, useState } from "react";
import useApi from "../ApiContext";
import { apiFetch } from "../../services/apiFetch";
import { toast } from "react-toastify";

const TranslationContext = createContext();

export default TranslationContext;

export function TranslationProvider({ children }) {
  const api = useApi();
  const [translatedText, setTranslatedText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function translate(translationData) {
    setLoading(true);
    setError("");
    setTranslatedText("");

    try {
      const response = await apiFetch(`${api}translate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(translationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Die Übersetzung ist fehlgeschlagen. Bitte erneut versuchen.",
        );
      }

      if (typeof data.translated_text !== "string") {
        throw new Error("Der Server hat keine gültige Übersetzung zurückgegeben.");
      }

      setTranslatedText(data.translated_text);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Die Übersetzung ist fehlgeschlagen.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <TranslationContext.Provider
      value={{
        translatedText,
        loading,
        error,
        translate,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}
