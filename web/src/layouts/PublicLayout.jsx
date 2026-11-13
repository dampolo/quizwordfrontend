import { Outlet } from "react-router-dom";
import Header from "../components/Header/header";
import Footer from "../components/Footer/footer";
import "./PublicLayout.scss";
import { useTranslation } from "react-i18next";
import { siteLanguageKey } from "../i18n/i18n";

function PublicLayout() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage;

  function changeLanguage(nextLanguage) {
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem(siteLanguageKey, nextLanguage);
  }

  return (
    <>
      <Header />
      <Outlet />
      <Footer language={language} onLanguageChange={changeLanguage} />
    </>
  );
}

export default PublicLayout;
