import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BackButton from "../../components/BackButton/BackButton";
import PageTitle from "../../components/PageTitle/PageTitle";
import "./contact.scss";
import { useAuth } from "../../context/useAuth";
import { toast } from "react-toastify";

function Contact() {
  const { postSupport, setConfirmationMessage } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false,
  });

  const [checkboxState, setCheckboxState] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const isNameValid = contactData.name.trim().length >= 3;
  const isEmailValid = emailRegex.test(contactData.email);
  const isMessageValid =
    contactData.message.trim().length >= 4 &&
    contactData.message.trim().length <= 20;

  const isFormValid = isNameValid && isEmailValid && isMessageValid;

  function handleChange(event) {
    const { name, value } = event.target;

    setContactData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleBlur(event) {
    const { name } = event.target;

    setTouched((previousTouched) => ({
      ...previousTouched,
      [name]: true,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setTouched({
      name: true,
      email: true,
      message: true,
    });

    setCheckboxChecked(true);

    setConfirmationMessage("Danke für deine Nachricht!");
    navigate("/confirmation?redirect=true");

    if (!isFormValid || !checkboxState) {
      return;
    }
    try {
      await postSupport(contactData);
      setConfirmationMessage("Danke für deine Nachricht!");
      navigate("/confirmation");
    } catch (error) {
      const message = error.response?.data;
      console.error(error.response?.data);
      toast.error(message);
    }
  }

  return (
    <main>
      <PageTitle title="Kontakt" />
      <BackButton to="/" className="back-button" />
      <section className="main-contact">
        <div className="title">
          <h1>{t("CONTACT.TITLE")}</h1>
        </div>

        <div className="description">
          <h2>{t("CONTACT.TITLE_H3")}</h2>

          <p>{t("CONTACT.DESCRIPTION_1")}</p>
          <p>{t("CONTACT.DESCRIPTION_2")} </p>
          <p>{t("CONTACT.DESCRIPTION_3")}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Input name */}
          <div className="input-container">
            <label htmlFor="name">{t("CONTACT.FORM_NAME")}</label>
            <input
              className="input-field"
              value={contactData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              minLength={3}
              placeholder=""
              type="text"
              id="name"
              name="name"
              required
            />

            {!isNameValid && touched.name && (
              <>
                <span className="warn-txt">
                  {t("CONTACT.FORM_NAME_REQUIED")}
                </span>
              </>
            )}

            {isNameValid && (
              <img
                className="confirm-mark"
                src="/assets/img/confirm.svg"
                alt=""
              />
            )}
          </div>

          {/* Input email */}
          <div className="input-container">
            <label htmlFor="email">{t("CONTACT.FORM_E_MAIL")}</label>
            <input
              className="input-field"
              value={contactData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder=""
              type="email"
              id="email"
              name="email"
              required
            />

            {!isEmailValid && touched.email && (
              <span className="warn-txt">
                {t("CONTACT.FORM_E_MAIL_REQUIED")}
              </span>
            )}

            {isEmailValid && (
              <img
                className="confirm-mark"
                src="/assets/img/confirm.svg"
                alt=""
              />
            )}
          </div>

          {/* Textarea */}
          <div className="textarea-container">
            <label htmlFor="message">{t("CONTACT.FORM_MESSAGE")}</label>
            <textarea
              value={contactData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              minLength={4}
              maxLength={5000}
              placeholder=""
              id="message"
              name="message"
              rows={5}
              required
            />

            {!isMessageValid && touched.message && (
              <span className="warn-txt">
                {t("CONTACT.FORM_MESSAGE_REQUIED")}
              </span>
            )}
          </div>

          <div className="checkbox-container">
            <input
              checked={checkboxState}
              onChange={(event) => setCheckboxState(event.target.checked)}
              type="checkbox"
              name="checkbox"
              id="checkbox"
            />

            <div className="checkbox-description">
              <label htmlFor="checkbox">
                {t("CONTACT.PRIVACY_1")}{" "}
                <Link className="privacy" to="/privacy-policy" target="_blank">
                  {t("CONTACT.PRIVACY_2")}
                </Link>{" "}
                {t("CONTACT.PRIVACY_3")}
              </label>

              {checkboxChecked && !checkboxState && (
                <span className="warn-txt">{t("CONTACT.CHECKBOX")}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="main-quiz-button"
            disabled={!isFormValid}
          >
            {t("CONTACT.SUBMIT_BUTTON", {
              defaultValue: "Senden",
            })}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Contact;
