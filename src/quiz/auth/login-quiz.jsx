import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import PreLoader from "../../components/PreLoader/PreLoader";
import { toast } from "react-toastify";

import "./login-quiz.scss";
import PageTitle from "../../components/PageTitle/PageTitle";

function LoginQuiz() {
  const initialValues = { email: "", password: "" };
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  async function loginWithEmailAndPassword(e) {
    e.preventDefault();

    const errors = validate(formValues);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const success = await login(formValues.email, formValues.password);

      if (success) {
        navigate("/my-quiz/all-words");
      }
    } catch (err) {
      const message =
        err.response?.detail ||
        "Login Fehler";

      toast.error(message);
      setFormErrors({
        message: message,
      });
    }
  }

  const validate = (values) => {
    const errors = {};

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    const regexPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%+\-/*?&])[A-Za-z\d@$!%+\-/*?&]{10,}$/;

    if (!values.email || !regexEmail.test(values.email)) {
      errors.email = "Dein E-Mail ist unvollständig/inkorrekt.";
    }

    if (!values.password || !regexPassword.test(values.password)) {
      errors.password = "Dein Passwort ist nicht korrekt.";
    }

    return errors;
  };


  return (
    <main>
      <PageTitle title="Login" />
      <section className="main-content-customer">
        <div className="form-title">
          <h1 className="form-title-name">Anmeldung</h1>
        </div>

        <p className="description">
          Wir empfehlen dir, die E-Mail-Adresse zu nutzen, die du bei der Arbeit
          verwendest.
        </p>
        <p className="description">
          Hast du kein konto?
          <Link className="new-user-link" to="/create-account">
            Konto erstellen
          </Link>
        </p>

        <form onSubmit={loginWithEmailAndPassword}>
          <div className="input-container">
            <label htmlFor="email">E-Mail-Adresse</label>
            <input
              className="input-field"
              type="email"
              name="email"
              placeholder="beispielname@email.com"
              autoComplete="email"
              value={formValues.email}
              onChange={handleChange}
            />

            <div className="input-icon">
              <img
                width="24"
                height="24"
                aria-hidden="true"
                src="./assets/mail-icon-input-field.svg"
                alt=""
              />
            </div>

            <div className="warn-txt">{formErrors.email}</div>
          </div>

          <div className="input-container">
            <label htmlFor="password">Passwort</label>
            <input
              autoComplete="current-password"
              className="input-field"
              type={isPasswordVisible ? "text" : "password"}
              name="password"
              placeholder="Passwort"
              value={formValues.password}
              onChange={handleChange}
            />

            <button
              type="button"
              className="eye-button"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
            >
              <img
                width="24"
                height="24"
                className="pwd-eye"
                src={
                  isPasswordVisible
                    ? "./assets/eye.svg"
                    : "./assets/eye-off.svg"
                }
                alt={isPasswordVisible ? "verstecken" : "zeigen"}
              />
            </button>

            <div className="input-icon">
              <img
                width="24"
                height="24"
                aria-hidden="true"
                src="./assets/pwd-lock-icon-input-field.svg"
                alt=""
              />
            </div>

            <div className="warn-txt warn-txt-hight">
              {formErrors.password || formErrors.message}
            </div>
          </div>

          {loading ? <PreLoader /> : <></>}

          <div className="btn-container">
            <button
              className="main-quiz-button"
              type="submit"
              disabled={loading}
            >
              Anmelden
            </button>
          </div>

          <Link className="btn-password" to="/forgot-password">
            Passwort vergessen?
          </Link>
          {/* 
            <div className="seperator-container">
            <span className="sep-line-txt">ODER</span>
            </div> */}
        </form>
      </section>
    </main>
  );
}

export default LoginQuiz;
