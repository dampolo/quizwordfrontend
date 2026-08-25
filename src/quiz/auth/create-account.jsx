import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import BackButton from "../../components/BackButton/BackButton";
import PreLoader from "../../components/PreLoader/PreLoader";
import { toast } from "react-toastify";
import PageTitle from "../../components/PageTitle/PageTitle";

function CreateAccount() {
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
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%+\-/*?&])[A-Za-z\d@$!%+\-/*?&]{10,}$/;
  const navigate = useNavigate();

  const { createAccount, loading, setConfirmationMessage } =
    useAuth();

  const isFormValid =
    regexEmail.test(formValues.email) &&
    regexPassword.test(formValues.password) &&
    formValues.password === formValues.repeated_password &&
    formValues.checked;

  async function submit(e) {
    e.preventDefault();

    const errors = validateInput(formValues, {
      email: true,
      password: true,
      repeated_password: true,
      checked: true,
    });

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await createAccount(formValues);
      console.log("Account created!");
      setConfirmationMessage(
        "Du bist erfolgreich registriert. Um dich anzumelden, musst du dein E-Mail bestätigen!",
      );
      navigate("/confirmation");
    } catch (err) {
      const message =
        err.response?.email?.[0] ||
        err.response?.password?.[0] ||
        err.response?.detail ||
        "Account creation failed";

      toast.error(message);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    const updatedValues = {
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    };

    setFormValues(updatedValues);
  }

  function handleBlur(e) {
    const { name, value, type, checked } = e.target;

    const updatedValues = {
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    };

    const newTouched = {
      ...touched,
      [name]: true,
    };

    setTouched(newTouched);
    setFormErrors(validateInput(updatedValues, newTouched));
  }

  function validateInput(values, touched) {
    const errors = {};

    if (touched.email && !regexEmail.test(values.email)) {
      errors.email = "E-Mail ist unvollständig/inkorrekt.";
    }

    if (touched.password && !regexPassword.test(values.password)) {
      errors.password =
        "Mindestens 10 Zeichen erforderlich: ein Klein- u. ein Großbuchstabe, eine Zahl und ein Sonderzeichen.";
    }

    if (
      touched.repeated_password &&
      values.password !== values.repeated_password
    ) {
      errors.notMatch = "Passwörter stimmen nicht überein.";
    }

    if (touched.checked && !values.checked) {
      errors.checked = "Bitte akzeptiere die Datenschutzerklärung.";
    }

    return errors;
  }

  return (
    <main>
      <PageTitle title="Konto restellen" />
      <section className="main-content-customer">
        <BackButton to="/login" />

        <div className="form-title">
          <h1 className="form-title-name">Konto erstellen</h1>
        </div>

        <p className="description">
          Hast du schon ein Konto?{" "}
          <Link className="new-user-link" to="/login">
            Anmelden
          </Link>
        </p>

        <form onSubmit={submit}>
          <div className="input-container">
            <label htmlFor="email">Dein E-Mail</label>

            <input
              id="email"
              name="email"
              autoComplete="email"
              className="input-field"
              type="email"
              placeholder="beispielname@email.com"
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
              <span>{formErrors.email}</span>
            </div>
          </div>

          <div className="input-container">
            <label htmlFor="password">Passwort</label>

            <input
              id="password"
              name="password"
              autoComplete="new-password"
              type={isPasswordTopVisible ? "text" : "password"}
              className="input-field input-field-pwd-icon"
              placeholder="Passwort"
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
                alt={isPasswordTopVisible ? "verstecken" : "zeigen"}
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

            <div className="warn-txt">{formErrors.password}</div>
          </div>

          <div className="input-container">
            <label htmlFor="repeated_password">Wiederhole dein Passwort</label>

            <input
              id="repeated_password"
              name="repeated_password"
              autoComplete="new-password"
              className="input-field"
              type={isPasswordBottomVisible ? "text" : "password"}
              placeholder="Wiederhole dein Passwort"
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
                alt={isPasswordBottomVisible ? "verstecken" : "zeigen"}
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

            <div className="warn-txt">{formErrors.notMatch}</div>
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
              <label htmlFor="checkbox" id="checkbox">
                Ich stimme der{" "}
                <Link className="privacy" to="/privacy-policy" target="blank"> 
                  Datenschutzerklärung 
                </Link>{" "}
                zu.
              </label>

              <div className="checkbox-description warn-txt">
                {formErrors.checked}
              </div>
            </div>
          </div>

          {loading ? <PreLoader /> : <></>}

          <div className="btn-container">
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="main-quiz-button"
            >
              Weiter
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default CreateAccount;
