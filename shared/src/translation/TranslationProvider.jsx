import { useState } from "react";
import useApi from "../api/useApi.js";
import useApiFetch from "../api/useApiFetch.js";

import TranslationContext from "./TranslationContext.jsx";

export function TranslationProvider({ children, api: apiOverride, apiFetch: fetchOverride, request, onError = console.error }) {
  const contextApi = useApi();
  const api = apiOverride ?? contextApi;
  const defaultFetch = useApiFetch(request, api);
  const apiFetch = fetchOverride ?? defaultFetch;
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
      onError(message);
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
