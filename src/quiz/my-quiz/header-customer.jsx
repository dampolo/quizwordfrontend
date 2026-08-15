import { useState } from "react";
import Logo from "../../components/logo";
import DialogCustomer from "./dialog-customer";

import "./header-customer.scss";

function HeaderCustomer() {
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function showDialog() {
    setIsProfileVisible(true);
  }

  function closeDialog() {
    setIsProfileVisible(false);
  }

  function openMenu() {
    setIsMenuOpen((prev) => !prev);
  }

  return (
    <section className="header-customer">
      <a href="/" className="logo">
        <Logo />
      </a>

      {/* <img
        width={45}
        height={45}
        className="message"
        src="/assets/bell.svg"
        alt="Nachrichten"
      /> */}

      <button onClick={showDialog}>
        <img
          width={40}
          height={40}
          className="profile-img"
          src="/assets/profile.svg"
          alt="Profile"
        />
      </button>

      <div
        className={`hide-container ${isProfileVisible ? "show-container" : ""}`}
        onClick={closeDialog}
      >
        <DialogCustomer
          isProfileVisible={isProfileVisible}
          setIsProfileVisible={setIsProfileVisible}
        />
      </div>

      <button
        onClick={openMenu}
        className={`hamburger hamburger--collapse ${
          isMenuOpen ? "is-active" : ""
        }`}
        type="button"
        aria-label={isMenuOpen ? "Schließe das Menu" : "Öffne das Menu"}
        aria-expanded={isMenuOpen}
      >
        <span className="hamburger-box">
          <span className="hamburger-inner"></span>
        </span>
      </button>
    </section>
  );
}

export default HeaderCustomer;
