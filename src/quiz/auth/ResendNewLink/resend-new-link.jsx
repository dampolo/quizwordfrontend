import { useState } from "react";
import { toast } from "react-toastify";
import "./resend-new-link.scss";
import { Link, useNavigate } from "react-router-dom";
import BackButton from "../../../components/BackButton/BackButton";
import { useAuth } from "../../../context/useAuth";
import PreLoader from "../../../components/PreLoader/PreLoader";
import PageTitle from "../../../components/PageTitle/PageTitle";

function ResendNewLink() {
  const { postResendVerification, setConfirmationMessage, loading } = useAuth();

  const initialValues = { email: "" };
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const isFormValid = regexEmail.test(formValues.email);
  const navigate = useNavigate();

  async function resendForm(e) {
    e.preventDefault();
    if (loading) return;

    const errors = validateInput(formValues);

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await postResendVerification(formValues);
      setConfirmationMessage(
        "Falls für diese E-Mail-Adresse ein unbestätigtes Konto besteht, haben wir einen neuen Bestätigungslink gesendet.",
      );
      navigate("/confirmation?redirect=true");
      setFormValues(initialValues);
    } catch (error) {
      const message = error.message || "Der Bestätigungslink konnte nicht gesendet werden. Bitte versuche es erneut.";
      toast.error(message);
      setFormErrors({ message });
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
    <main className="main-auth">
      <PageTitle title="Neuen Bestätigungslink anfordern" />
      <section className="main-content-customer">
        <BackButton to="/login" />

        <div className="form-title">
          <h1 className="form-title-name">Neuen Bestätigungslink anfordern</h1>
        </div>

        <form className="form" onSubmit={resendForm}>
          <div className="input-container">
            <label htmlFor="email">Bitte gib deine E-Mail ein:</label>

            <input
              className="input-field"
              id="email"
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
                src="/assets/mail-icon-input-field.svg"
                alt=""
              />
            </div>

            <div className="warn-txt">{formErrors.email}</div>
          </div>

          <p className="description">
            Wir senden Dir eine E-Mail <br />
            mit einem neuen Bestätigungslink.
          </p>

          {formErrors.message && <p className="warn-txt" role="alert">{formErrors.message}</p>}

          {loading ? <PreLoader /> : <></>}

          <div className="btn-container">
            <Link className="back-button" to="/login">
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


export default ResendNewLink;
