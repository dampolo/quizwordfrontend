import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./forgot-password.scss";
import { Link, useNavigate } from "react-router-dom";
import BackButton from "../../../components/BackButton/BackButton";
import { useAuth } from "../../../context/auth/useAuth";
import PreLoader from "../../../components/PreLoader/PreLoader";
import PageTitle from "../../../components/PageTitle/PageTitle";

function ForgotPassword() {
  const { t } = useTranslation();
  const { forgotPassword, setConfirmationMessage, loading } = useAuth();

  const initialValues = { email: "" };
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const isFormValid = regexEmail.test(formValues.email);
  const navigate = useNavigate();

  async function recoveryForm(e) {
    e.preventDefault();

    const errors = validateInput(formValues);

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await forgotPassword(formValues);
      setConfirmationMessage(t("FORGOT_PASSWORD.CONFIRMATION"));
      navigate("/confirmation?redirect=true");
      setFormValues(initialValues);
    } catch (error) {
      console.error(error);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const updatedValues = {
      ...formValues,
      [name]: value,
    };
    setFormValues(updatedValues);
    setFormErrors(validateInput(updatedValues));
  }

  function validateInput(values) {
    const errors = {};

    if (!regexEmail.test(values.email)) {
      errors.email = true;
    }

    return errors;
  }

  return (
    <main className="main-auth">
      <PageTitle title={t("FORGOT_PASSWORD.TITLE")} />
      <section className="main-content-customer">
        <BackButton to="/login" label={t("CREATE_ACCOUNT.BACK_TO_LOGIN")} />

        <div className="form-title">
          <h1 className="form-title-name">{t("FORGOT_PASSWORD.TITLE")}</h1>
        </div>

        <form className="form" onSubmit={recoveryForm}>
          <div className="input-container">
            <label htmlFor="email">{t("FORGOT_PASSWORD.EMAIL_PROMPT")}</label>

            <input
              className="input-field"
              id="email"
              type="email"
              name="email"
              placeholder={t("LOGIN.EMAIL_PLACEHOLDER")}
              autoComplete="email"
              value={formValues.email}
              onChange={handleChange}
            />

            <div className="input-icon">
              <img
                width={24}
                height={24}
                aria-hidden="true"
                src="./assets/mail-icon-input-field.svg"
                alt=""
              />
            </div>

            <div className="warn-txt">
              {formErrors.email && t("LOGIN.INVALID_EMAIL")}
            </div>
          </div>

          <p className="description">
            {t("FORGOT_PASSWORD.DESCRIPTION")}
          </p>

          {loading && <PreLoader label={t("LOGIN.LOADING")} />}

          
          <div className="btn-container">
            <Link className="back-button" to="/customer/profile">
              {t("FORGOT_PASSWORD.CANCEL")}
            </Link>

            <button
              className="main-quiz-button"
              type="submit"
              disabled={!isFormValid || loading}
            >
              {t("FORGOT_PASSWORD.SUBMIT")}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}


export default ForgotPassword;
