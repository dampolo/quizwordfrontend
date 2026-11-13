import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/auth/useAuth";
import BackButton from "../../../components/BackButton/BackButton";
import PreLoader from "../../../components/PreLoader/PreLoader";
import { toast } from "react-toastify";
import PageTitle from "../../../components/PageTitle/PageTitle";

function CreateAccount() {
  const { t } = useTranslation();
  const initialValues = {
    email: "",
    password: "",
    repeated_password: "",
    checked: false,
  };
  const [touched, setTouched] = useState({});
  const [formValues, setFormValues] = useState(initialValues);
  const [isPasswordTopVisible, togglePasswordVisibilityTop] = useState(false);
  const [isPasswordBottomVisible, togglePasswordVisibilityBottom] =
    useState(false);
  const [formErrors, setFormErrors] = useState({});
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const regexPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%+\-/*?&#])[A-Za-z\d@$!%+\-/*?&#]{10,}$/;
  
	const navigate = useNavigate();

  const { createAccount, loginWithGoogle, loading, setConfirmationMessage } = useAuth();

  const isFormValid = Object.keys(validateInput(formValues)).length === 0;

  async function handleSubmit(e) {
    e.preventDefault();

    const errors = validateInput(formValues);

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    await submitAccount(formValues);
  }

  async function submitAccount(values) {
    try {
      await createAccount(values);
      setConfirmationMessage(t("CREATE_ACCOUNT.CONFIRMATION"));
      navigate("/confirmation");
    } catch (err) {
      const message =
        err.response?.email?.[0] ||
        err.response?.password?.[0] ||
        err.response?.detail ||
        t("CREATE_ACCOUNT.ERROR");

      toast.error(message);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
	
    setFormValues((previousValues) => ({
      ...previousValues,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleBlur(e) {
    const { name } = e.target;

    const newTouched = {
      ...touched,
      [name]: true,
    };

    setTouched(newTouched);
    setFormErrors(validateInput(formValues, newTouched));
  }

  function validateInput(
    values,
    touchedFields = {
      email: true,
      password: true,
      repeated_password: true,
      checked: true,
    },
  ) {
    const errors = {};

    if (touchedFields.email && !regexEmail.test(values.email)) {
      errors.email = true;
    }

    if (touchedFields.password && !regexPassword.test(values.password)) {
      errors.password = true;
    }

    if (
      touchedFields.repeated_password &&
      values.password !== values.repeated_password
    ) {
      errors.notMatch = true;
    }

    if (touchedFields.checked && !values.checked) {
      errors.checked = true;
    }

    return errors;
  }

  return (
    <main className="main-auth">
      <PageTitle title={t("LOGIN.CREATE_ACCOUNT")} />
      <section className="main-content-customer">
        <BackButton to="/login" label={t("CREATE_ACCOUNT.BACK_TO_LOGIN")} />

        <div className="form-title">
          <h1 className="form-title-name">{t("LOGIN.CREATE_ACCOUNT")}</h1>
        </div>

        <p className="description">
          {t("CREATE_ACCOUNT.HAS_ACCOUNT")}{" "}
          <Link className="new-user-link" to="/login">
            {t("LOGIN.SUBMIT")}
          </Link>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <label htmlFor="email">{t("LOGIN.EMAIL")}</label>

            <input
              id="email"
              name="email"
              autoComplete="email"
              className="input-field"
              type="email"
              placeholder={t("LOGIN.EMAIL_PLACEHOLDER")}
              value={formValues.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <div className="input-icon">
              <img
                width={24}
                height={24}
                aria-hidden="true"
                src="/assets/mail-icon-input-field.svg"
                alt=""
              />
            </div>

            <div className="warn-txt">
              <span>{formErrors.email && t("LOGIN.INVALID_EMAIL")}</span>
            </div>
          </div>

          <div className="input-container">
            <label htmlFor="password">{t("LOGIN.PASSWORD")}</label>

            <input
              id="password"
              name="password"
              autoComplete="new-password"
              type={isPasswordTopVisible ? "text" : "password"}
              className="input-field input-field-pwd-icon"
              placeholder={t("LOGIN.PASSWORD")}
              value={formValues.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <button
              type="button"
              className="eye-button"
              onClick={() => togglePasswordVisibilityTop((prev) => !prev)}
            >
              <img
                width={24}
                height={24}
                className="pwd-eye"
                src={
                  isPasswordTopVisible
                    ? "/assets/eye.svg"
                    : "/assets/eye-off.svg"
                }
                alt={t(isPasswordTopVisible ? "LOGIN.HIDE_PASSWORD" : "LOGIN.SHOW_PASSWORD")}
              />
            </button>

            <div className="input-icon">
              <img
                width={24}
                height={24}
                aria-hidden="true"
                src="/assets/pwd-lock-icon-input-field.svg"
                alt=""
              />
            </div>

            <div className="warn-txt">
              {formErrors.password && t("CREATE_ACCOUNT.PASSWORD_REQUIREMENTS")}
            </div>
          </div>

          <div className="input-container">
            <label htmlFor="repeated_password">{t("CREATE_ACCOUNT.REPEAT_PASSWORD")}</label>

            <input
              id="repeated_password"
              name="repeated_password"
              autoComplete="new-password"
              className="input-field"
              type={isPasswordBottomVisible ? "text" : "password"}
              placeholder={t("CREATE_ACCOUNT.REPEAT_PASSWORD")}
              value={formValues.repeated_password}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <button
              type="button"
              className="eye-button"
              onClick={() => togglePasswordVisibilityBottom((prev) => !prev)}
            >
              <img
                width={24}
                height={24}
                className="pwd-eye"
                src={
                  isPasswordBottomVisible
                    ? "/assets/eye.svg"
                    : "/assets/eye-off.svg"
                }
                alt={t(isPasswordBottomVisible ? "LOGIN.HIDE_PASSWORD" : "LOGIN.SHOW_PASSWORD")}
              />
            </button>

            <div className="input-icon">
              <img
                width={24}
                height={24}
                src="/assets/pwd-lock-icon-input-field.svg"
                alt=""
              />
            </div>

            <div className="warn-txt">
              {formErrors.notMatch && t("CREATE_ACCOUNT.PASSWORD_MISMATCH")}
            </div>
          </div>

          <div className="checkbox-container">
            <div className="checkbox-content">
              <input
                id="checkbox"
                type="checkbox"
                name="checked"
                checked={formValues.checked}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div className="checkbox-description">
              <label htmlFor="checkbox">
                <Trans
                  t={t}
                  i18nKey="CREATE_ACCOUNT.PRIVACY_AGREEMENT"
                  components={{
                    privacyLink: <Link className="privacy" to="/privacy-policy" target="blank" />,
                  }}
                />
              </label>

              <div className="checkbox-description warn-txt">
                {formErrors.checked && t("CREATE_ACCOUNT.PRIVACY_REQUIRED")}
              </div>
            </div>
          </div>

          {loading && <PreLoader label={t("LOGIN.LOADING")} />}

          <div className="btn-container">
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="main-quiz-button"
            >
              {t("CREATE_ACCOUNT.CONTINUE")}
            </button>
          </div>
          <div className="seperator-container">
            <span className="sep-line-txt">{t("LOGIN.OR")}</span>
          </div>

          <button
            className="btn-google"
            type="button"
            onClick={loginWithGoogle}
            disabled={loading}
          >
            <img
              src="/assets/google-logo-icon.svg"
              width={38}
              height={38}
              alt=""
              aria-hidden="true"
            />
            {t("LOGIN.GOOGLE")}
          </button>
        </form>
      </section>
    </main>
  );
}

export default CreateAccount;
