import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./change-password.scss";
import { useAuth } from "../../../../context/useAuth";
import { toast } from "react-toastify";
import BackButton from "../../../../components/BackButton/BackButton";
import PreLoader from "../../../../components/PreLoader/PreLoader";

function ChangePassword() {
  const { postChangePassword, setConfirmationMessage, logout } = useAuth();

  const initialValues = {
    old_password: "",
    new_password: "",
    repeated_new_password: "",
  };
  const [touched, setTouched] = useState({});
  const [formValues, setFormValues] = useState(initialValues);
  const [isPasswordOldVisible, togglePasswordVisibilityOld] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isPasswordTopVisible, togglePasswordVisibilityTop] = useState(false);
  const [isPasswordBottomVisible, togglePasswordVisibilityBottom] =
    useState(false);
  const [formErrors, setFormErrors] = useState({});
  const regexPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%+\-/*?&])[A-Za-z\d@$!%+\-/*?&]{10,}$/;

  const isFormValid =
    formValues.new_password &&
    formValues.repeated_new_password &&
    regexPassword.test(formValues.new_password) &&
    regexPassword.test(formValues.repeated_new_password);

  const navigate = useNavigate();
  function handleBlur(e) {
    const { name, value } = e.target;

    const updatedValues = {
      ...formValues,
      [name]: value,
    };

    const newTouched = {
      ...touched,
      [name]: true,
    };

    setTouched(newTouched);
    setFormErrors(validateInput(updatedValues, newTouched));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      old_password: formValues.old_password,
      new_password: formValues.new_password,
      repeated_new_password: formValues.repeated_new_password,
    };
    try {
      const data = await postChangePassword(payload);

      setConfirmationMessage("Dein Password wurde erfolgreich geändert.");
      toast.success(data.detail);
      logout()
      navigate("/confirmation?redirect=true");
      setFormValues(initialValues);
    } catch (error) {
      const message =
        error.response?.repeated_new_password?.[0] || "Fehler bei der Änderung";

      toast.error(message);
      setFormErrors({
        message: message,
      });
      setLoading(false);

    } finally {
      setLoading(false);
    }
  }

  function validateInput(values, touched) {
    const errors = {};

    if (touched.new_password && !regexPassword.test(values.new_password)) {
      errors.new_password =
        "Mindestens 10 Zeichen erforderlich: ein Klein- u. ein Großbuchstabe, eine Zahl und ein Sonderzeichen.";
    }

    if (
      touched.repeated_new_password &&
      values.new_password !== values.repeated_new_password
    ) {
      errors.notMatch = "Passwörter stimmen nicht überein.";
    }

    return errors;
  }

  return (
    <section className="change-password-customer">
      <BackButton className="arrow-profile" to="/my-quiz/profile/" />

      <div className="form-title">
        <h1 className="form-title-name">Passwort ändern</h1>
      </div>

      <form onSubmit={submit}>
        <div className="input-container">
          <label htmlFor="old_password">Altes Passwort</label>

          <input
            name="old_password"
            id="old_password"
            className="input-field"
            type={isPasswordOldVisible ? "text" : "password"}
            placeholder="Neues Passwort"
            value={formValues.old_password}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="old_password"
          />

          <button
            type="button"
            className="eye-button"
            onClick={() => togglePasswordVisibilityOld((prev) => !prev)}
          >
            <img
              width={24}
              height={24}
              className="pwd-eye"
              src={
                isPasswordOldVisible ? "/assets/eye.svg" : "/assets/eye-off.svg"
              }
              alt={isPasswordOldVisible ? "verstecken" : "zeigen"}
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

          <div className="warn-txt">{formErrors.old_password}</div>
        </div>

        <div className="input-container">
          <label htmlFor="new_password">Neues Passwort</label>

          <input
            name="new_password"
            id="new_password"
            className="input-field"
            type={isPasswordTopVisible ? "text" : "password"}
            placeholder="Neues Passwort"
            value={formValues.new_password}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="new_password"
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
                isPasswordTopVisible ? "/assets/eye.svg" : "/assets/eye-off.svg"
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

          <div className="warn-txt">{formErrors.new_password}</div>
        </div>

        <div className="input-container">
          <label htmlFor="repeated_new_password">
            Wiederhole neues Passwort
          </label>

          <input
            name="repeated_new_password"
            id="repeated_new_password"
            className="input-field"
            type={isPasswordBottomVisible ? "text" : "password"}
            placeholder="Wiederhole neues Passwort"
            value={formValues.repeated_new_password}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="repeated_new_password"
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
              aria-hidden="true"
              src="/assets/pwd-lock-icon-input-field.svg"
              alt=""
            />
          </div>
        </div>

        <div className="warn-txt">{formErrors.notMatch}</div>

        {loading ? <PreLoader /> : <></>}

        <div className="btn-container">
          <button
            type="submit"
            className="main-quiz-button"
            disabled={!isFormValid || loading}
          >
            Passwort ändern
          </button>
        </div>
      </form>
    </section>
  );
}

export default ChangePassword;
