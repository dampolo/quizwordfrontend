import React, { useEffect } from "react";
import BackButton from "../BackButton/BackButton";
import { Link, useParams, useSearchParams } from "react-router-dom";
import styles from "./confirmation.module.scss";
import { useAuth } from "../../context/useAuth";

function Confirmation() {
  const { confirmationMessage, verifyEmail, setConfirmationMessage } =
    useAuth();
  const { uidb64, token } = useParams();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") === "true";

  useEffect(() => {
    if (uidb64 && token) {
      async function verify() {
        try {
          await verifyEmail(uidb64, token);
          setConfirmationMessage("Dein E-Mail wurde erfolgreich bestätigt.");
        } catch (error) {
          console.error(error);
        }
      }
      verify();
    }
  }, [uidb64, token]);

  return (
    <main className={styles.confirmation}>
      <section className={styles.content}>
        { !redirect ?
           <></> : <BackButton to={"/login"} />
        }

        <div className={styles.title}>
          <h1 className={styles.heading}>Bestätigung</h1>
        </div>

        <div className={styles.description}>
          <p>{confirmationMessage}</p>

          {!redirect ? (
            <><Link className={styles.link} to="/">
              Quiz Word
            </Link></>
          ) : (
            <Link className={styles.link} to="/login">
              Anmelden
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}

export default Confirmation;
