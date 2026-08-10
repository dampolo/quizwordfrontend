import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./ChooseLanguages.scss";
import useVocabulary from "../../context/useVocabulary";
import LanguageForm from "./LanguageForm";

function ChooseLanguages() {
  const { languages, postLanguages, getUserLanguages } = useVocabulary();
  const navigate = useNavigate();

  const [nativeLanguage, setNativeLanguage] = useState("");
  const [learningLanguages, setLearningLanguages] = useState([]);

  function handleNativeLanguageChange(id) {
    setNativeLanguage(id);
    setLearningLanguages((prev) =>
      prev.filter((lang) => lang !== id)
    );
  }

  function handleCheckboxChange(id) {
    setLearningLanguages((prev) =>
      prev.includes(id)
        ? prev.filter((lang) => lang !== id)
        : [...prev, id]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      native_language_id: nativeLanguage,
      learning_languages_id: learningLanguages,
    };

    try {
      await postLanguages(payload);

      navigate(
        `/my-quiz/all-words?language=${learningLanguages[0]}`
      );
      getUserLanguages();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main>
      <section className="main-content-customer choose-languages">
        <LanguageForm
          languages={languages}
          nativeLanguage={nativeLanguage}
          learningLanguages={learningLanguages}
          onNativeChange={handleNativeLanguageChange}
          onLearningChange={handleCheckboxChange}
          onSubmit={handleSubmit}
          buttonText="Bestätigen"
        />
      </section>
    </main>
  );
}

export default ChooseLanguages;