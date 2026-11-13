import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../styles/auth.scss";

function VerifyEmailRequired() {
  const { t } = useTranslation();

  return (
    <main className="main-auth">
      <section className="main-content-customer confirm-email">
        <h1 className="form-title">{t("VERIFY_EMAIL_REQUIRED.TITLE")}</h1>
        <p className="description">
          {t("VERIFY_EMAIL_REQUIRED.DESCRIPTION")}
        </p>
        <p className="description">
          <Link className="new-user-link" to="/resend-new-link">
            {t("VERIFY_EMAIL_REQUIRED.RESEND_LINK")}
          </Link>
        </p>
      </section>
    </main>
  );
}

export default VerifyEmailRequired;
