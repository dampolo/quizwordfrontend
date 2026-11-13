import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/auth/useAuth";
import PreLoader from "../../../components/PreLoader/PreLoader";
import { toast } from "react-toastify";

import "./login-quiz.scss";
import PageTitle from "../../../components/PageTitle/PageTitle";

function LoginQuiz() {
  const { t } = useTranslation();
  const initialValues = { email: "", password: "" };
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const { login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const errors = validate(formValues);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    await loginWithEmailAndPassword();
  }

  async function loginWithEmailAndPassword() {
    try {
      const response = await login(formValues.email, formValues.password);
      if (!response) return;

      navigate("/my-quiz/all-words");
    } catch (err) {
      const message = err.response?.detail;

      toast.error(message || t("LOGIN.ERROR"));
      setFormErrors({ login: true, message });
    }
  }


  function handleSubmitWIthGoogle() {
    loginWithGoogle();
  }


  function validate(values) {
    const errors = {};

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    const regexPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%+\-/*?&#])[A-Za-z\d@$!%+\-/*?&#]{10,}$/;

    if (!values.email || !regexEmail.test(values.email)) {
      errors.email = true;
    }

    if (!values.password || !regexPassword.test(values.password)) {
      errors.password = true;
    }

    return errors;
  }

  return (
    <main className="main-auth">
      <PageTitle title={t("LOGIN.TITLE")} />
      <section className="main-content-customer">
        <div className="form-title">
          <h1 className="form-title-name">{t("LOGIN.TITLE")}</h1>
        </div>

        <p className="description">
          {t("LOGIN.DESCRIPTION")}
        </p>
        <p className="description">
          {t("LOGIN.NO_ACCOUNT")}{" "}
          <Link className="new-user-link" to="/create-account">
            {t("LOGIN.CREATE_ACCOUNT")}
          </Link>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <label htmlFor="email">{t("LOGIN.EMAIL")}</label>
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

          <div className="input-container">
            <label htmlFor="password">{t("LOGIN.PASSWORD")}</label>
            <input
              autoComplete="current-password"
              id="password"
              className="input-field"
              type={isPasswordVisible ? "text" : "password"}
              name="password"
              placeholder={t("LOGIN.PASSWORD")}
              value={formValues.password}
              onChange={handleChange}
            />

            <button
              type="button"
              className="eye-button"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
            >
              <img
                width={24}
                height={24}
                className="pwd-eye"
                src={
                  isPasswordVisible
                    ? "./assets/eye.svg"
                    : "./assets/eye-off.svg"
                }
                alt={t(isPasswordVisible ? "LOGIN.HIDE_PASSWORD" : "LOGIN.SHOW_PASSWORD")}
              />
            </button>

            <div className="input-icon">
              <img
                width={24}
                height={24}
                aria-hidden="true"
                src="./assets/pwd-lock-icon-input-field.svg"
                alt=""
              />
            </div>

            <div className="warn-txt warn-txt-hight">
              {formErrors.password && t("LOGIN.INVALID_PASSWORD")}
              {formErrors.login && (formErrors.message || t("LOGIN.ERROR"))}
            </div>
          </div>

          {loading && <PreLoader label={t("LOGIN.LOADING")} />}

          <div className="btn-container">
            <button
              className="main-quiz-button"
              type="submit"
              disabled={loading}
            >
              {t("LOGIN.SUBMIT")}
            </button>
          </div>

          <Link className="btn-password" to="/forgot-password">
            {t("LOGIN.FORGOT_PASSWORD")}
          </Link>
          <div className="seperator-container">
            <span className="sep-line-txt">{t("LOGIN.OR")}</span>
          </div>

          <button
            className="btn-google"
            type="button"
            onClick={handleSubmitWIthGoogle}
            disabled={loading}
          >
            <img src="/assets/google-logo-icon.svg" width={38} height={38} alt="" aria-hidden="true" />
            {t("LOGIN.GOOGLE")}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginQuiz;
