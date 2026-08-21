import "./edit-category.scss";
import useVocabulary from "../../context/useVocabulary";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton/BackButton";
import PreLoader from "../../components/PreLoader/PreLoader";
import { toast } from "react-toastify";
import useDialog from "../../context/DialogContext/useDialgo";
import { useTranslation } from "react-i18next";

function EditCategory() {
  const {
    getCategory,
    updateCategory,
    userLanguages,
    loading,
    deleteCategory,
  } = useVocabulary();
  const { id } = useParams();
  const navigate = useNavigate();
  const { openDialog } = useDialog();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    language_id: "",
    category_name: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updateCategory(Number(id), formData);
      toast.success(`Kategorie "${formData.category_name}" wurde geändert!`);
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
      toast.success(`Kategorie "${formData.category_name}" wurde gelöscht!`);
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
      <BackButton
        to={`/my-quiz/vocabulary-categories/?language=${formData.language_id}`}
      />
      <div className="form-header">
        <div className="header-icon">
          <svg
            _ngcontent-ng-c4017599241=""
            width="19"
            height="19"
            viewBox="0 0 19 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              _ngcontent-ng-c4017599241=""
              d="M2 17H3.4L12.025 8.375L10.625 6.975L2 15.6V17ZM16.3 6.925L12.05 2.725L13.45 1.325C13.8333 0.941667 14.3043 0.75 14.863 0.75C15.421 0.75 15.8917 0.941667 16.275 1.325L17.675 2.725C18.0583 3.10833 18.2583 3.571 18.275 4.113C18.2917 4.65433 18.1083 5.11667 17.725 5.5L16.3 6.925ZM1 19C0.716667 19 0.479333 18.904 0.288 18.712C0.0960001 18.5207 0 18.2833 0 18V15.175C0 15.0417 0.025 14.9127 0.075 14.788C0.125 14.6627 0.2 14.55 0.3 14.45L10.6 4.15L14.85 8.4L4.55 18.7C4.45 18.8 4.33767 18.875 4.213 18.925C4.08767 18.975 3.95833 19 3.825 19H1Z"
              fill="#1C1B1F"
            ></path>
          </svg>
        </div>

        <div>
          <h2>Edit Kategorie</h2>
          <p>{t("EDIT_CATEGORY.DESCRIPTION")}</p>
        </div>
      </div>

      <form className="category-form" onSubmit={handleSubmit}>
        <div className="form-group category-group">
          <label>
            {t("EDIT_CATEGORY.LANGUAGE")} <span>*</span>
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
            {t("EDIT_CATEGORY.CATEGORY_NAME")}
          </label>
          <input
            id="categoryName"
            type="text"
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            autoComplete="off"
            required
          />
          <small>{t("EDIT_CATEGORY.CATEGORY_HINT")}</small>
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
          <button type="button" onClick={handleDelete}>
            <img src="/assets/trash.svg" alt="delete" />
          </button>
          <Link
            type="button"
            className="main-quiz-button-cancel"
            to={`/my-quiz/vocabulary-categories/?language=${formData.language_id}`}
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
    </section>
  );
}
export default EditCategory;
