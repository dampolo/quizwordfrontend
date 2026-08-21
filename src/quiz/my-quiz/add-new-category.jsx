import "./add-new-category.scss";
import { Link, useNavigate } from "react-router-dom";
import useVocabulary from "../../context/useVocabulary";
import { useState } from "react";
import BackButton from "../../components/BackButton/BackButton";
import PreLoader from "../../components/PreLoader/PreLoader";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function AddNewCategory() {
  const { createCategory, loading, userLanguages } = useVocabulary();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    language_id: "",
    category_name: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await createCategory(formData);
      toast.success(`Kategorie wurde "${formData.category_name}" hinzugefügt!`);
      navigate(
        `/my-quiz/vocabulary-categories/?language=${formData.language_id}`,
      );
      setFormData({ language_id: "", category_name: "" });
    } catch (err) {
      const message =
        err.response?.translations?.[0] || err.response?.detail?.[0] || "Error";

      toast.error(message);
    }
  }

  if (loading) {
    return (
      <div className="show-container ">
        <PreLoader />
      </div>
    );
  }

  return (
    <div className="add-category-card">
      <BackButton to="/my-quiz/vocabulary-categories/" />

      <div className="form-header">
        <div className="header-icon">✚</div>

        <div>
          <h2>{t("ADD_NEW_CATEGORY.TITLE")}</h2>
          <p>{t("ADD_NEW_CATEGORY.DESCRIPTION")}</p>
        </div>
      </div>

      <form className="category-form" onSubmit={handleSubmit}>
        <div className="form-group category-group">
          <label htmlFor="language_id">
            {t("ADD_NEW_CATEGORY.LANGUAGE")} <span>*</span>
          </label>

          <select
            name="language_id"
            value={formData.language_id}
            onChange={handleChange}
            required
          >
            <option value="">Wähle Sprache</option>
            {userLanguages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.language_name}
              </option>
            ))}
          </select>
        </div>
        <div className="input-wrap">
          <label htmlFor="categoryName">
            {t("ADD_NEW_CATEGORY.CATEGORY_NAME")}
          </label>
          <input
            id="categoryName"
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            type="text"
            autoComplete="off"
            placeholder="e.g., Business Travel"
          />
          <small>{t("ADD_NEW_CATEGORY.CATEGORY_HINT")}</small>
        </div>

        {/* <div className="color-section">
          <h4>Selected Color Theme</h4>

          <div className="color-options">
            <button type="button" className="color-option active purple" />
            <button type="button" className="color-option green" />
            <button type="button" className="color-option orange" />
            <button type="button" className="color-option pink" />
          </div>
        </div> */}

        <div className="form-actions">
          <Link
            type="button"
            className="main-quiz-button-cancel"
            to="/my-quiz/vocabulary-categories"
          >
            {t("BUTTONS.CANCEL")}
          </Link>

          <button
            type="submit"
            className="main-quiz-button save-btn"
            disabled={
              !(
                formData.category_name.trim().length >= 3 &&
                !!formData.language_id
              )
            }
          >
            {t("BUTTONS.SAVE")}
          </button>
        </div>
      </form>
    </div>
  );
}
export default AddNewCategory;
