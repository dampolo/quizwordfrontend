import { useState } from "react";
import Logo from "../../../components/Logo/logo";

import styles from "./header-customer.module.scss";
import { useAuth } from "../../../context/useAuth";
import DialogCustomer from "../DialogCustomer/dialog-customer";

function HeaderCustomer() {
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile } = useAuth();

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
    <section className={styles["header-customer"]}>
      <a href="/" className={styles["logo"]}>
        <Logo />
      </a>

      {/* <img
        width={45}
        height={45}
        className={styles["message"]}
        src="/assets/bell.svg"
        alt="Nachrichten"
      /> */}

      <button onClick={showDialog}>
        <img
          width={40}
          height={40}
          className={`${styles["profile-img"]} avatar`}
          src={profile?.image || "/assets/profile.svg"}
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
        className={`${styles["hamburger"]} hamburger hamburger--collapse ${
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
