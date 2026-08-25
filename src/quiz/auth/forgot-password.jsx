import { useState } from "react";
import "./forgot-password.scss";
import { Link, useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton/BackButton";
import { useAuth } from "../../context/useAuth";
import PreLoader from "../../components/PreLoader/PreLoader";
import PageTitle from "../../components/PageTitle/PageTitle";

function ForgotPassword() {
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
      setConfirmationMessage("Du kannst jetzt dein E-Mail prüfen.");
      navigate("/confirmation");
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
      errors.email = "E-Mail ist unvollständig/inkorrekt.";
    }

    return errors;
  }

  return (
    <main>
      <PageTitle title="Passwort vergessen" />
      <section className="main-content-customer">
        <BackButton to="/login" />

        <div className="form-title">
          <h1 className="form-title-name">Passwort vergessen</h1>
        </div>

        <form className="form" onSubmit={recoveryForm}>
          <div className="input-container">
            <label htmlFor="email">Bitte gib deine E-Mail ein:</label>

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

          <p className="description">
            Wir senden Dir eine E-Mail, <br />
            über die Du dein Passwort ändern kannst.
          </p>

          {loading ? <PreLoader /> : <></>}

          
          <div className="btn-container">
            <Link className="back-button" to="/customer/profile">
              Abbrechen
            </Link>

            <button
              className="main-quiz-button"
              type="submit"
              disabled={!isFormValid || loading}
            >
              E-Mail senden
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}


export default ForgotPassword;
