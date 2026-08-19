import BackButton from "../BackButton/BackButton";

function LanguageForm({
  languages,
  nativeLanguage,
  learningLanguages,
  onNativeChange,
  onLearningChange,
  onSubmit,
  buttonText,
}) {
  return (
    <form onSubmit={onSubmit}>
      <h1 className="form-title">Wähle deine Sprachen</h1>
      <div className="input-container">
        <p className="description languages">Wähle deine Muttersprache:</p>

        {languages.map((language) => (
          <label key={language.id} className="radio-option">
            <input
              type="radio"
              value={language.id}
              checked={nativeLanguage === language.id}
              onChange={() => onNativeChange(language.id)}
            />
            {language.language_name}
          </label>
        ))}
      </div>

      <div className="input-container">
        <p className="description">Wähle Sprachen die du lernen möchtest:</p>

        {languages.map((language) => (
          <label key={language.id} className="checkbox-option">
            <input
              type="checkbox"
              checked={learningLanguages.includes(language.id)}
              disabled={language.id === nativeLanguage}
              onChange={() => onLearningChange(language.id)}
            />
            {language.language_name}
          </label>
        ))}
      </div>

      <button
        type="submit"
        className="main-quiz-button"
        disabled={!(nativeLanguage && learningLanguages.length >= 1)}
      >
        {buttonText}
      </button>
    </form>
  );
}

export default LanguageForm;
