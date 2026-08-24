import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import "./change-email.scss";
import { useAuth } from "../../../../context/useAuth";
import BackButton from "../../../../components/BackButton/BackButton";

function ChangeEmail() {
  const initialValues = { email: "", password: "" };
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const { postChangeEmail, loading, setConfirmationMessage, logout } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });    
  };

  async function changeEmail(e) {
    e.preventDefault();

    const errors = validate(formValues);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = {
      new_email: formValues.new_email,
      password: formValues.password,

    }

    try {
      await postChangeEmail(payload);
      setConfirmationMessage("Dein E-Mail wurde erfolgreich geändert.");
      navigate("/confirmation");
      await logout()
    } catch (err) {
      const message =
        err.response?.new_email?.[0] ||
        err.response?.password?.[0] ||
        err.response?.detail?.[0] ||
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

    if (!values.new_email || !regexEmail.test(values.new_email)) {
      errors.email = "Dein E-Mail ist unvollständig/inkorrekt.";
    }

    if (!values.password || !regexPassword.test(values.password)) {
      errors.password = "Dein Passwort ist nicht korrekt.";
    }

    return errors;
  };

  return (
    <section className="change-email-customer">
      <BackButton className="arrow-profile" to="/my-quiz/profile/" />

      <div className="form-title">
        <h1 className="form-title-name">Änderung deines E-Mails</h1>
      </div>

      <p className="description">
        Gib die neue E-Mail-Adresse ein, die du ab jetzt für die Anmeldung
        verwenden möchtest.
      </p>

      <form onSubmit={changeEmail}>
        <div className="input-container">
          <label htmlFor="new_email">Deine neue E-Mail-Adresse</label>
          <input
            className="input-field"
            type="new_email"
            name="new_email"
            placeholder="beispielname@email.com"
            autoComplete="new_email"
            value={formValues.new_email}
            onChange={handleChange}
          />

          <div className="input-icon">
            <img
              width="24"
              height="24"
              aria-hidden="true"
              src="/assets/mail-icon-input-field.svg"
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
              width={24}
              height={24}
              className="pwd-eye"
              src={
                isPasswordVisible ? "/assets/eye.svg" : "/assets/eye-off.svg"
              }
              alt={isPasswordVisible ? "verstecken" : "zeigen"}
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

          <div className="warn-txt warn-txt-hight">
            {formErrors.password || formErrors.message}
          </div>
        </div>

        {loading ? <PreLoader /> : <></>}

        <div className="btn-container">
          <button className="main-quiz-button" type="submit" disabled={loading}>
            Ändern
          </button>
        </div>
      </form>
    </section>
  );
}

export default ChangeEmail;
