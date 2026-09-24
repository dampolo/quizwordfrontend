import styles from "./add-new-quiz.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useQuiz from "../../../../context/useQuiz";
import BackButton from "../../../../components/BackButton/BackButton";

function AddNewQuiz() {
  const { createQuiz } = useQuiz();
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    quiz_name: "",
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
      await createQuiz(formData);
      setFormData({ quiz_name: "" });
      navigate("/my-quiz/quizzes/");
    } catch (err) {
      console.error(err);
      
    }

  }

  return (
    <div className={styles["add-category-card"]}>
      <BackButton to="/my-quiz/all-quizzes/"/>
      <div className={styles["form-header"]}>
        <div className={styles["header-icon"]}>✚</div>

        <div>
          <h2>Add New Quiz</h2>
          <p>Organize your quizzes by topics or themes.</p>
        </div>
      </div>

      <form className={styles["category-form"]} onSubmit={handleSubmit}>
        <label htmlFor="quiz_name">Category Name</label>

        <div className={styles["input-wrap"]}>
          <input
            id="quiz_name"
            name="quiz_name"
            value={formData.quiz_name}
            onChange={handleChange}
            type="text"
            placeholder="e.g., Business Travel"
            autoComplete="off"
          />
          <span className={styles["input-icon"]}>⌘</span>
        </div>

        <small>Short, descriptive names work best for navigation.</small>

        <div className={styles["color-section"]}>
          <h4>Selected Color Theme</h4>

          <div className={styles["color-options"]}>
            <button type="button" className={`${styles["color-option"]} ${styles["active"]} ${styles["purple"]}`} />
            <button type="button" className={`${styles["color-option"]} ${styles["green"]}`} />
            <button type="button" className={`${styles["color-option"]} ${styles["orange"]}`} />
            <button type="button" className={`${styles["color-option"]} ${styles["pink"]}`} />
          </div>
        </div>

        <div className={styles["form-actions"]}>
          <Link
            type="button"
            className="main-quiz-button-cancel"
            to="/my-quiz/all-categories"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className={`main-quiz-button ${styles["save-btn"]}`}
            disabled={formData.quiz_name.trim().length < 3}
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
export default AddNewQuiz;
