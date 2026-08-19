import { Link } from "react-router-dom";
import "./header.scss";
import { useState } from "react";
import Logo from "./logo";
import { HashLink } from "react-router-hash-link";
import { useTranslation } from "react-i18next";

function Header() {
  const [active, setActive] = useState("");
  const { t } = useTranslation();

  return (
    <header className="navbar">
      <div className="navbar__container">
        {/* Logo */}
        <Link href="#" className="navbar__logo">
          <Logo />
        </Link>

        {/* Navigation */}
        <nav className="navbar__menu">
          <HashLink smooth
            to="/#how-it-works"
            className={
              active === "how-it-works"
                ? "navbar__link navbar__link--active"
                : "navbar__link"
            }
            onClick={() => setActive("how-it-works")}
          >
            {t("HEADER.HOW_IT_WORKS")}
          </HashLink>

          <HashLink smooth
            to="/#how-to-use-it"
            className={
              active === "how-to-use-it"
                ? "navbar__link navbar__link--active"
                : "navbar__link"
            }
            onClick={() => setActive("how-to-use-it")}
          >
            {t("HEADER.HOW_TO_USE_IT")}
          </HashLink>

          <HashLink
            to="/#success-stories"
            className={
              active === "success-stories"
                ? "navbar__link navbar__link--active"
                : "navbar__link"
            }
            onClick={() => setActive("success-stories")}
          >
            {t("HEADER.SUCCESS")}
            
          </HashLink>
          <Link
            to="/price"
            className={
              active === "price"
                ? "navbar__link navbar__link--active"
                : "navbar__link"
            }
            onClick={() => setActive("price")}
          >
            {t("HEADER.PRICE")}
          </Link>
        </nav>

        {/* <Actions */}
        <div className="navbar__actions">
          <Link className="navbar__login" to="/login">
            Login
          </Link>
          <Link className="navbar__button" to="/create-account">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
