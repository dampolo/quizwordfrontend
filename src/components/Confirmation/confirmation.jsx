import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import InvalidLink from "../../quiz/auth/InvalidLink/invalid-link";
import BackButton from "../BackButton/BackButton";
import { Link, useParams, useSearchParams } from "react-router-dom";
import styles from "./confirmation.module.scss";
import { useAuth } from "../../context/useAuth";

function Confirmation() {
  const [invalidLink, setInvalidLink] = useState(false);
  const { confirmationMessage, verifyEmail, setConfirmationMessage } =
    useAuth();
  const { uidb64, token } = useParams();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") === "true";

  useEffect(() => {
    let active = true;
    setInvalidLink(false);
    if (uidb64 && token) {
      async function verify() {
        try {
          await verifyEmail(uidb64, token);
          if (!active) return;
          setConfirmationMessage("Dein E-Mail wurde erfolgreich bestätigt.");
        } catch (error) {
          if (!active) return;
          if (error.status === 400) {
            setInvalidLink(true);
            toast.error("Dieser Link ist ungültig oder abgelaufen.");
          } else {
            toast.error(
              "Die E-Mail konnte nicht bestätigt werden. Bitte versuche es erneut.",
            );
          }
        }
      }
      verify();
    }
    return () => {
      active = false;
    };
  }, [uidb64, token]);

  if (invalidLink) return <InvalidLink />;

  return (
    <main className={styles["confirmation"]}>
      <section className={styles["content"]}>
        {!redirect ? <></> : <BackButton to={"/login"} />}

        <div className={styles["title"]}>
          <h1 className={styles["heading"]}>Bestätigung</h1>
        </div>

        <div className={styles["description"]}>
          <p>{confirmationMessage}</p>

          {redirect ? (
            <>
              <Link className={styles["link"]} to="/">
                Quiz Word
              </Link>
            </>
          ) : (
            <Link className={styles["link"]} to="/login">
              Anmelden
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}

export default Confirmation;
