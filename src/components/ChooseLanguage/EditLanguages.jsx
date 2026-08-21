import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./ChooseLanguages.scss";
import useVocabulary from "../../context/useVocabulary";
import LanguageForm from "./LanguageForm";
import BackButton from "../BackButton/BackButton";
import { toast } from "react-toastify";

function EditLanguages() {
  const {
    languages,
    getUserLanguages,
    postLanguages,
  } = useVocabulary();

  const navigate = useNavigate();

  const [nativeLanguage, setNativeLanguage] = useState("");
  const [learningLanguages, setLearningLanguages] = useState([]);

  useEffect(() => {
    async function loadLanguages() {
      try {
        const data = await getUserLanguages();

        setNativeLanguage(data.native_language.id);

        setLearningLanguages(
          data.learning_languages.map((language) => language.id)
        );
      } catch (err) {
        console.error(err);
      }
    }

    loadLanguages();
  }, []);

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

      toast.success(`Die Sprachen wurde geändert !`);
      navigate(
        `/my-quiz/all-words?language=${learningLanguages[0]}`
      );
      getUserLanguages()
    } catch (err) {
      const message =
        err.response?.translations?.[0] || err.response?.detail?.[0] || "Error";

      toast.error(message);
    }
  }

  return (
    <>
      <section className="main-content-customer choose-languages">
        <BackButton className="arrow-profile" to="/my-quiz/profile/" />

        <LanguageForm
          languages={languages}
          nativeLanguage={nativeLanguage}
          learningLanguages={learningLanguages}
          onNativeChange={handleNativeLanguageChange}
          onLearningChange={handleCheckboxChange}
          onSubmit={handleSubmit}
          buttonText="Speichern"
        />
      </section>
    </>
  );
}

export default EditLanguages;