import { createContext, useState } from "react";
import useApi from "../ApiContext";
import { apiFetch } from "../../services/apiFetch";

const TranslationContext = createContext();
export default TranslationContext;

export function TranslationProvider({ children }) {
  const api = useApi();
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function translate({ text, source, target }) {
    setLoading(true);
    setError("");
    setTranslatedText("");

    try {
      const response = await apiFetch(`${api.replace(/\/$/, "")}/translate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source, target }),
      });
      if (!response.ok) throw new Error("Die Übersetzung ist fehlgeschlagen. Bitte erneut versuchen.");
      const data = await response.json();
      if (typeof data.translated_text !== "string") {
        throw new Error("Der Server hat keine gültige Übersetzung zurückgegeben.");
      }
      setTranslatedText(data.translated_text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Die Übersetzung ist fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <TranslationContext.Provider value={{ translate, translatedText, loading, error }}>
      {children}
    </TranslationContext.Provider>
  );
}
