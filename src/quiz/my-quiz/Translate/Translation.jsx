import { useState } from "react";
import UseTranslation from "../../../context/TranslationContex/UseTranslation";
import useVocabulary from "../../../context/useVocabulary";
import "./translate.scss";

function Translation() {
  const [text, setText] = useState("");
  const { nativeLanguage, userLanguages = [] } = useVocabulary();
  const languageOptions = [nativeLanguage, ...userLanguages].filter(
    (language, index, all) => language?.id &&
      all.findIndex((item) => item?.id === language.id) === index,
  );
  const getCode = (language) => {
    const code = (language?.language_code || language?.code || "").trim();
    // The translation endpoint accepts de/en/es; speech uses regional codes.
    const baseCode = code.toLowerCase().split(/[-_]/)[0];
    return ["de", "en", "es"].includes(baseCode) ? baseCode : code;
  };
  const [selectedSource, setSource] = useState(null);
  const [selectedTarget, setTarget] = useState(null);
  const sourceId = selectedSource ?? String(nativeLanguage?.id ?? "");
  const targetId = selectedTarget ?? String(userLanguages[0]?.id ?? "");
  const source = getCode(languageOptions.find((language) => String(language.id) === sourceId));
  const target = getCode(languageOptions.find((language) => String(language.id) === targetId));
  const { translate, translatedText, loading, error } = UseTranslation();

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading || !text.trim() || !source.trim() || !target.trim()) return;
    await translate({ text: text.trim(), source: source.trim(), target: target.trim() });
  }

  return (
    <section className="translation">
      <h2>Übersetzer</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <label htmlFor="translation-text">Text</label>
          <textarea id="translation-text" name="text" value={text}
            onChange={(event) => setText(event.target.value)} required rows={4} />
          <label htmlFor="translation-source">Ausgangssprache</label>
          <select id="translation-source" name="source" value={sourceId}
            onChange={(event) => setSource(event.target.value)} required>
            <option value="">Wähle Sprache</option>
            {languageOptions.map((language) => (
              <option key={language.id} value={String(language.id)}>
                {language.language_name}
              </option>
            ))}
          </select>
          <label htmlFor="translation-target">Zielsprache</label>
          <select id="translation-target" name="target" value={targetId}
            onChange={(event) => setTarget(event.target.value)} required>
            <option value="">Wähle Sprache</option>
            {languageOptions.map((language) => (
              <option key={language.id} value={String(language.id)}>
                {language.language_name}
              </option>
            ))}
          </select>
          {sourceId && targetId && (!source || !target) && (
            <p role="alert">Für eine ausgewählte Sprache fehlt der Sprachcode. Bitte lade die Seite nach dem Backend-Update neu.</p>
          )}
          <button type="submit" disabled={loading || !text.trim() || !source.trim() || !target.trim()}>
            {loading ? "Wird übersetzt…" : "Übersetzen"}
          </button>
        </fieldset>
      </form>
      {error && <p role="alert">{error}</p>}
      <div aria-live="polite" aria-busy={loading}>
        {translatedText && <><h3>Übersetzung</h3><p className="translation-result">{translatedText}</p></>}
      </div>
    </section>
  );
}

export default Translation;
