import "./edit-category.scss";
import useVocabulary from "../../context/useVocabulary";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton/BackButton";
import PreLoader from "../../components/PreLoader/PreLoader";
import { toast } from "react-toastify";
import useDialog from "../../context/DialogContext/useDialgo";

function EditCategory() {
  const { getCategory, updateCategory, languages, loading, deleteCategory } = useVocabulary();
  const { id } = useParams();
  const navigate = useNavigate();
  const { openDialog } = useDialog();

  const [formData, setFormData] = useState({
    language_id: "",
    category_name: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updateCategory(Number(id), formData);
      toast.success(
        `Kategorie "${formData.category_name}" wurde geändert!`,
      );
      navigate(
        `/my-quiz/vocabulary-categories/?language=${formData.language_id}`,
      );
    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  useEffect(() => {
    async function loadCategry() {
      try {
        const category = await getCategory(id);
        setFormData(category);
      } catch (err) {
        console.error(err);
      }
    }

    loadCategry();
  }, [id]);

    function handleDelete() {
    openDialog({
      title: "Löschen?",
      description: "Bist du sicher?",
      confirmText: "Löschen",
      cancelText: "Abbrechen",
      confirmButtonClass: "main-quiz-button",
      cancelButtonClass: "main-quiz-button-cancel",

      onConfirm: deleteCurrentCategory,
    });
  }

   async function deleteCurrentCategory() {
    try {
      await deleteCategory(Number(id));
      toast.success(
        `Kategorie "${formData.category_name}" wurde gelöscht!`,
      );
      navigate(
        `/my-quiz/vocabulary-categories/?language=${formData.language_id}`,
      );
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
    <section className="add-category-card">
      <BackButton to={`/my-quiz/vocabulary-categories/?language=${formData.language_id}`} />
      <div className="form-header">
        <div className="header-icon">✚</div>

        <div>
          <h2>Edit Category</h2>
          <p>Organize your vocabulary by topics or themes.</p>
        </div>
      </div>

      <form className="category-form" onSubmit={handleSubmit}>
        <div className="form-group category-group">
          <label>
            Sprache <span>*</span>
          </label>

          <select
            name="language_id"
            value={formData.language_id}
            onChange={handleChange}
            required
          >
            {languages.map((lang) => (
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
            type="text"
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            autoComplete="off"
            required
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
          <button type="button" onClick={handleDelete}>
            <img src="/assets/trash.svg" alt="delete" />
          </button>
          <Link
            type="button"
            className="main-quiz-button-cancel"
            to={`/my-quiz/vocabulary-categories/?language=${formData.language_id}`}
          >
            Abbrechen
          </Link>

          <button
            type="submit"
            className="main-quiz-button save-btn"
            disabled={formData.category_name.trim().length < 3}
          >
            Speichern
          </button>
        </div>
      </form>
    </section>
  );
}
export default EditCategory;
