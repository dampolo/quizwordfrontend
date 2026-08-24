import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import "./change-username.scss";
import { useAuth } from "../../../../context/useAuth";
import BackButton from "../../../../components/BackButton/BackButton";

function ChangeUsername() {
  const initialValues = { username: ""};
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const { postChangeEmail, loading, setConfirmationMessage, logout } =
    useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  async function changeUsername(e) {
    e.preventDefault();

    const errors = validate(formValues);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = {
      username: formValues.username,
    };

    try {
      await postChangeEmail(payload);
      setConfirmationMessage("Dein E-Mail wurde erfolgreich geändert.");
      navigate("/confirmation");
      await logout();
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

    const regexUsername = /^\S{5,10}$/;

    if (!values.username || !regexUsername.test(values.username)) {
      errors.username = "Mindestens 5, maximal 10 Zeichen und keine Leerzeichen.";
    }


    return errors;
  };

  return (
    <section className="change-username">
      <BackButton className="arrow-profile" to="/my-quiz/profile/" />

      <div className="form-title">
        <h1 className="form-title-name">Username ändern</h1>
      </div>

      <p className="description">
        Gib die neue E-Mail-Adresse ein, die du ab jetzt für die Anmeldung
        verwenden möchtest.
      </p>

      <form onSubmit={changeUsername}>
        <div className="input-container">
          <label htmlFor="username">Deine neue E-Mail-Adresse</label>
          <input
            className="input-field"
            type="username"
            name="username"
            placeholder="beispielname@email.com"
            autoComplete="username"
            value={formValues.username}
            onChange={handleChange}
          />

          <div className="input-icon">
            <img
              width="24"
              height="24"
              aria-hidden="true"
              src="/assets/username.svg"
              alt=""
            />
          </div>

          <div className="warn-txt">{formErrors.email}</div>
        </div>

        {loading ? <PreLoader /> : <></>}

        <div className="btn-container">
          <button className="main-quiz-button" type="submit" disabled={formValues.username.length <= 4}>
            Ändern
          </button>
        </div>
      </form>
    </section>
  );
}

export default ChangeUsername;
