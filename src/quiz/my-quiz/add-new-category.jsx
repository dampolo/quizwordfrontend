import "./add-new-category.scss";
import { Link, useNavigate } from "react-router-dom";
import useVocabulary from "../../context/useVocabulary";
import { useState } from "react";
import BackButton from "../../components/BackButton/BackButton";
import PreLoader from "../../components/PreLoader/PreLoader";
import { toast } from "react-toastify";


function AddNewCategory() {
  const { createCategory, loading, userLanguages } = useVocabulary();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    language_id: "",
    category_name: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    console.log(formData);
    
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
      navigate(`/my-quiz/vocabulary-categories/?language=${formData.language_id}`);
      setFormData({ language_id: "", category_name: "" });
    } catch (err) {
      console.error(err);
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
          <h2>Add New Category</h2>
          <p>Organize your vocabulary by topics or themes.</p>
        </div>
      </div>

      <form className="category-form" onSubmit={handleSubmit}>
        <div className="form-group category-group">
          <label htmlFor="language_id">
            Sprache <span>*</span>
          </label>

          <select
            name="language_id"
            value={formData.language_id}
            onChange={handleChange}
            required
          >
            {userLanguages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.language_name}
              </option>
            ))}
          </select>
        </div>
        <label htmlFor="categoryName">Category Name</label>
        <div className="input-wrap">
          <input
            id="categoryName"
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            type="text"
            autocomplete="off"
            placeholder="e.g., Business Travel"
          />
          <span className="input-icon">⌘</span>
        </div>

        <small>Short, descriptive names work best for navigation.</small>

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
            Cancel
          </Link>

          <button
            type="submit"
            className="main-quiz-button save-btn"
            disabled={formData.category_name.trim().length < 3}
          >
            <img
              width={24}
              height={24}
              src="/assets/save-word-icon.svg"
              alt=""
            />
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
export default AddNewCategory;
