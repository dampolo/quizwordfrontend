import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/footer";
import "./PublicLayout.scss";
import HeaderCustomer from "../quiz/my-quiz/HeaderCustomer/header-customer";
import NavbarCustomer from "../quiz/my-quiz/NavbarCustomer/navbar-customer";
import { useTranslation } from "react-i18next";
import { siteLanguageKey } from "../i18n/i18n";

function MyQuiz() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage;

  function changeLanguage(nextLanguage) {
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem(siteLanguageKey, nextLanguage);
  }

  return (
    <>
      <main className="main-customer">
        <HeaderCustomer />

        <div className="main-content">
          <NavbarCustomer />
          <Outlet />
        </div>
      </main>
      <Footer language={language} onLanguageChange={changeLanguage} />
    </>
  );
}

export default MyQuiz;
