import { Link } from "react-router-dom";
import "../../styles/auth.scss";

function VerifyEmailRequired() {
  return (
    <main className="main-auth">
      <section className="main-content-customer confirm-email">
        <h1 className="form-title">E-Mail bestätigen</h1>
        <p className="description">
          Bitte bestätige deine E-Mail-Adresse. Den Bestätigungslink findest
          du in deinem Postfach.
        </p>
        <p className="description">
          <Link className="new-user-link" to="/resend-new-link">
            Neuen Bestätigungslink anfordern
          </Link>
        </p>
      </section>
    </main>
  );
}

export default VerifyEmailRequired;
