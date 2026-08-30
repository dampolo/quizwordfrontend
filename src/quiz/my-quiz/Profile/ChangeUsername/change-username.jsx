import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import "./change-username.scss";
import { useAuth } from "../../../../context/useAuth";
import BackButton from "../../../../components/BackButton/BackButton";
import PreLoader from "../../../../components/PreLoader/PreLoader";

function ChangeUsername() {
  const initialValues = { username: "" };
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const { patchChangeUsername } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  }

  async function changeUsername(e) {
    setLoading(true);

    e.preventDefault();

    const errors = validate(formValues);

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    const payload = {
      username: formValues.username,
    };

    try {
      await patchChangeUsername(payload);
      toast.success("Username wurde geändert!");

      navigate("/my-quiz/profile");
    } catch (err) {
      const message = err.response?.username?.[0] || "Username Fehler";

      toast.error(message);
      setFormErrors({ username: message });
    }
    setLoading(false);
  }

  function validate(values) {
    const errors = {};

    const regexUsername = /^\S{4,10}$/;
    if (!values.username || !regexUsername.test(values.username)) {
      errors.username =
        "Mindestens 4, maximal 10 Zeichen und keine Leerzeichen.";
    }

    return errors;
  }

  return (
    <section className="change-username">
      <BackButton className="arrow-profile" to="/my-quiz/profile/" />

      <div className="form-title">
        <h1 className="form-title-name">Username ändern</h1>
      </div>

      <p className="description">
        Hier kannst einen neuen Benutzernamen eingeben.
      </p>

      <form onSubmit={changeUsername} noValidate>
        <div className="input-container">
          <label htmlFor="username">Dein neuer Benutzername</label>
          <input
            className="input-field"
            type="text"
            name="username"
            placeholder="username"
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

          <div className="warn-txt">{formErrors.username}</div>
        </div>

        {loading ? <PreLoader /> : <></>}

        <div className="btn-container">
          <button
            className="main-quiz-button"
            type="submit"
            disabled={formValues.username.length <= 4}
          >
            Ändern
          </button>
        </div>
      </form>
    </section>
  );
}

export default ChangeUsername;
