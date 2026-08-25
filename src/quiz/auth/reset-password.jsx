import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import "./login-quiz.scss";
import { useAuth } from "../../context/useAuth";
import { toast } from "react-toastify";

function ResetPassword() {

    const { resetPassword, setConfirmationMessage, loading } = useAuth();

  const initialValues = {
    password1: "",
    password2: "",
  };
  const [touched, setTouched] = useState({});
  const [formValues, setFormValues] = useState(initialValues);
  const [isPasswordTopVisible, togglePasswordVisibilityTop] = useState(false);
  const [isPasswordBottomVisible, togglePasswordVisibilityBottom] =
    useState(false);
  const [formErrors, setFormErrors] = useState({});
  const regexPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%+\-/*?&])[A-Za-z\d@$!%+\-/*?&]{10,}$/;

  const isFormValid = 
  formValues.password1 && 
  formValues.password2 && 
  regexPassword.test(formValues.password1) &&
  regexPassword.test(formValues.password2);
  
    const navigate = useNavigate();

    const { uid, token } = useParams();

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
    console.log(formValues);
  }

  async function submit(e) {
    e.preventDefault();

    try {
      await resetPassword(formValues.password1, uid, token);
      setConfirmationMessage("Dein Password wurde erfolgreich geändert.");
      navigate("/confirmation");
      setFormValues(initialValues);
    } catch (error) {
      toast.error
      console.error(error);
    }
    

  }

  function validateInput(values, touched) {
    const errors = {};

    if (touched.password1 && !regexPassword.test(values.password1)) {
      errors.password1 =
        "Mindestens 10 Zeichen erforderlich: ein Klein- u. ein Großbuchstabe, eine Zahl und ein Sonderzeichen.";
    }

    if (touched.password2 && values.password1 !== values.password2) {
      errors.notMatch = "Passwörter stimmen nicht überein.";
    }

    return errors;
  }

  return (
    <main>
      <PageTitle title="Passwort zurücksetzen" />
      <section className="main-content-customer">
        <Link className="arrow-back" to="/kurse/login">
          {/* <Back /> */}
        </Link>

        <div className="form-title">
          <h1 className="form-title-name">Passwort zurücksetzen</h1>
        </div>

        <form onSubmit={submit}>
          <div className="input-container">
            <label htmlFor="password1">Passwort</label>

            <input
              name="password1"
              id="password1"
              className="input-field"
              type={isPasswordTopVisible ? "text" : "password"}
              placeholder="Neues Passwort"
              value={formValues.password1}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="password1"
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

            <div className="warn-txt">{formErrors.password1}</div>
          </div>

          <div className="input-container">
            <label htmlFor="password2">Wiederhole dein Passwort</label>

            <input
              name="password2"
              id="password2"
              className="input-field"
              type={isPasswordBottomVisible ? "text" : "password"}
              placeholder="Wiederhole neues Passwort"
              value={formValues.password2}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="password2"
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
    </main>
  );
}

export default ResetPassword;
