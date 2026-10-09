import { NavLink } from "react-router-dom";
import styles from "./navbar-customer.module.scss";
import useVocabulary from "../../../context/useVocabulary";

function NavbarCustomer() {
  const { userLanguages = [] } = useVocabulary();

  const firstLanguage = userLanguages[0]?.id;

  const categoriesUrl = firstLanguage
    ? `/my-quiz/all-categories?language=${firstLanguage}`
    : "/my-quiz/all-categories";

  const allWordsUrl = firstLanguage
    ? `/my-quiz/all-words?language=${firstLanguage}`
    : "/my-quiz/all-words";

  const quizzesUrl = firstLanguage
    ? `/my-quiz/all-quizzes?language=${firstLanguage}`
    : "/my-quiz/all-quizzes";


  return (
    <ul className={styles["navbar-customer"]}>
      <li>
        <NavLink
          to={categoriesUrl}
          className={({ isActive }) => (isActive ? styles["active"] : "")}
        >
          <img
            width={24}
            height={24}
            src="/assets/categories-icon.svg"
            alt=""
          />
          <span className={styles["nav-link-text"]}>Kategorien</span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to={allWordsUrl}
          className={({ isActive }) => (isActive ? styles["active"] : "")}
        >
          <img width={24} height={24} src="/assets/words.svg" alt="" />
          <span className={styles["nav-link-text"]}>Wörter</span>
        </NavLink>
      </li>

      <li className={styles["add-new-word"]}>
        <NavLink
          to="/my-quiz/add-new-word"
          className={({ isActive }) => (isActive ? styles["active"] : "")}
        >
          <img width={24} height={24} src="/assets/add.svg" alt="" />
          <span className={styles["nav-link-text"]}>Neu</span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to={quizzesUrl}
          className={({ isActive }) => (isActive ? styles["active"] : "")}
        >
          <img width={24} height={24} src="/assets/quiz-icon.svg" alt="" />
          <span className={styles["nav-link-text"]}>Quizze</span>
        </NavLink>
      </li>

      <li>
        <NavLink to="/my-quiz/sett" className={({ isActive }) => (isActive ? styles["active"] : "")}>
          <img width={24} height={24} src="/assets/translate.svg" alt="" />
          <span className={styles["nav-link-text"]}>Übersetzer</span>
        </NavLink>
      </li>
    </ul>
  );
}

export default NavbarCustomer;