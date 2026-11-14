import { NavLink, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./navbar-customer.module.scss";
import useVocabulary from "../../../context/vocabulary/useVocabulary";

function NavbarCustomer() {
  const { t } = useTranslation();
  const { userLanguages = [] } = useVocabulary();

  const [searchParams] = useSearchParams();
  const languageUrl = searchParams.get("language") || userLanguages[0]?.id;

  const categoriesUrl = languageUrl
    ? `/my-quiz/all-categories?language=${languageUrl}`
    : "/my-quiz/all-categories";

  const allWordsUrl = languageUrl
    ? `/my-quiz/all-words?language=${languageUrl}`
    : "/my-quiz/all-words";

  const quizzesUrl = languageUrl
    ? `/my-quiz/all-quizzes?language=${languageUrl}`
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
          <span className={styles["nav-link-text"]}>{t("NAVBAR.CATEGORIES")}</span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to={allWordsUrl}
          className={({ isActive }) => (isActive ? styles["active"] : "")}
        >
          <img width={24} height={24} src="/assets/words.svg" alt="" />
          <span className={styles["nav-link-text"]}>{t("NAVBAR.ALL_WORDS")}</span>
        </NavLink>
      </li>

      <li className={styles["add-new-word"]}>
        <NavLink
          to="/my-quiz/add-new-word"
          className={({ isActive }) => (isActive ? styles["active"] : "")}
        >
          <img width={24} height={24} src="/assets/add.svg" alt="" />
          <span className={styles["nav-link-text"]}>{t("NAVBAR.NEW")}</span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to={quizzesUrl}
          className={({ isActive }) => (isActive ? styles["active"] : "")}
        >
          <img width={24} height={24} src="/assets/quiz-icon.svg" alt="" />
          <span className={styles["nav-link-text"]}>{t("NAVBAR.QUIZZES")}</span>
        </NavLink>
      </li>

      <li>
        <NavLink to="/my-quiz/translation" className={({ isActive }) => (isActive ? styles["active"] : "")}>
          <img width={24} height={24} src="/assets/translate.svg" alt="" />
          <span className={styles["nav-link-text"]}>{t("NAVBAR.TRANSLATOR")}</span>
        </NavLink>
      </li>
    </ul>
  );
}

export default NavbarCustomer;
