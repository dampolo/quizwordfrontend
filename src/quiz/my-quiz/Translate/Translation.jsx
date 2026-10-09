import { useState } from "react";
import UseTranslation from "../../../context/TranslationContex/UseTranslation";
import useVocabulary from "../../../context/useVocabulary";
import "./translate.scss";

function Translation() {
  const [text, setText] = useState("");
  const { nativeLanguage, userLanguages = [] } = useVocabulary();
  const languageOptions = [nativeLanguage, ...userLanguages].filter(
    (language, index, all) => language?.id &&
      (language.language_code || language.code) &&
      all.findIndex((item) => item?.id === language.id) === index,
  );
  const getCode = (language) => language?.language_code || language?.code || "";
  const [selectedSource, setSource] = useState(null);
  const [selectedTarget, setTarget] = useState(null);
  const source = selectedSource ?? getCode(nativeLanguage);
  const target = selectedTarget ?? getCode(userLanguages[0]);
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
          <select id="translation-source" name="source" value={source}
            onChange={(event) => setSource(event.target.value)} required>
            <option value="">Wähle Sprache</option>
            {languageOptions.map((language) => (
              <option key={language.id} value={getCode(language)}>
                {language.language_name}
              </option>
            ))}
          </select>
          <label htmlFor="translation-target">Zielsprache</label>
          <select id="translation-target" name="target" value={target}
            onChange={(event) => setTarget(event.target.value)} required>
            <option value="">Wähle Sprache</option>
            {languageOptions.map((language) => (
              <option key={language.id} value={getCode(language)}>
                {language.language_name}
              </option>
            ))}
          </select>
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
