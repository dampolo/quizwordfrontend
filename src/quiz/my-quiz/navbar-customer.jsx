import { NavLink } from "react-router-dom";
import "./navbar-customer.scss";
import useVocabulary from "../../context/useVocabulary";

function NavbarCustomer() {
  const { userLanguages = [] } = useVocabulary();

  const firstLanguage = userLanguages[0]?.id;

  const categoriesUrl = firstLanguage
    ? `/my-quiz/vocabulary-categories?language=${firstLanguage}`
    : "/my-quiz/vocabulary-categories";

  const allWordsUrl = firstLanguage
    ? `/my-quiz/all-words?language=${firstLanguage}`
    : "/my-quiz/all-words";

  const quizzesUrl = firstLanguage
    ? `/my-quiz/all-quizzes?language=${firstLanguage}`
    : "/my-quiz/all-quizzes";

  function closeMenu() {}

  return (
    <ul className="navbar-customer">
      <li>
        <NavLink
          to={categoriesUrl}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <img
            width={24}
            height={24}
            src="/assets/categories-icon.svg"
            alt=""
          />
          <span className="nav-link-text">Kategorien</span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to={allWordsUrl}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <img width={24} height={24} src="/assets/words.svg" alt="" />
          <span className="nav-link-text">Wörter</span>
        </NavLink>
      </li>

      <li className="add-new-word">
        <NavLink
          to="/my-quiz/add-new-word"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <img width={24} height={24} src="/assets/add.svg" alt="" />
          <span className="nav-link-text">Neu</span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to={quizzesUrl}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <img width={24} height={24} src="/assets/quiz-icon.svg" alt="" />
          <span className="nav-link-text">Quizze</span>
        </NavLink>
      </li>

      <li>
        <NavLink to="/my-quiz/settings" onClick={closeMenu}>
          <img width={25} height={25} src="/assets/settings.svg" alt="" />
          <span className="nav-link-text">Einstellungen</span>
        </NavLink>
      </li>
    </ul>
  );
}

export default NavbarCustomer;