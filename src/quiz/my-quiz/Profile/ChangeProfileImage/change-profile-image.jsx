import { useState } from "react";
import { toast } from "react-toastify";

import styles from "./change-profile-image.module.scss";
import { useAuth } from "../../../../context/useAuth";
import BackButton from "../../../../components/BackButton/BackButton";
import PreLoader from "../../../../components/PreLoader/PreLoader";

function ChangeProfileImage() {
  const [formErrors, setFormErrors] = useState({});
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageDeleted, setImageDeleted] = useState(false);
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

  function handleImageChange(event) {
    const file = event.target.files[0];

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setSelectedImage(null);
      setPreview(null);
      event.target.value = "";

      const message = "Das Bild darf maximal 2 MB groß sein.";

      toast.error(message);
      setFormErrors({ image: message });
      return;
    }

    setFormErrors({});
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setImageDeleted(false);
  }

  async function handleDelete() {
    try {
      await updateProfile({ image: null });

      setSelectedImage(null);
      setPreview(null);

      toast.success("Das Profilbild wurde gelöscht.");
    } catch (err) {
      const message =
        err.image?.[0] ||
        err.detail?.[0] ||
        err.detail ||
        "Das Profilbild konnte nicht geändert werden.";

      toast.error(message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validate(selectedImage);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = new FormData();
    payload.append("image", selectedImage);

    setLoading(true);
    try {
      await updateProfile(payload);
      toast.success("Das Profilbild wurde geändert.");
    } catch (err) {
      const message =
        err.image?.[0] ||
        err.detail?.[0] ||
        err.detail ||
        "Das Profilbild konnte nicht geändert werden.";

      toast.error(message);
      setFormErrors({ image: message });
    } finally {
      setLoading(false);
    }
  }

  function validate(image) {
    const errors = {};

    if (image && image.size > MAX_FILE_SIZE) {
      errors.image = "Das Bild darf maximal 2 MB groß sein.";
    }

    return errors;
  }

  return (
    <section className={styles["change-profile-image"]}>
      <BackButton className="arrow-profile" to="/my-quiz/profile/" />

      <div className={styles["form-title"]}>
        <h1 className={styles["form-title-name"]}>Ändere deine Foto</h1>
      </div>

      <p className={styles["description"]}>
        Du kannst hier dein Foto hinzüfugen.
      </p>
      <form onSubmit={handleSubmit}>
        <div className={styles["input-container"]}>
          <label htmlFor="image">Foto</label>
          <img
            className="avatar"
            width={100}
            height={100}
            src={
              preview ||
              (!imageDeleted && profile?.image) ||
              "/assets/profile.svg"
            }
            alt="Vorschau des Profilbildes"
          />

          <div className={`main-quiz-button ${styles["choose-btn"]}`}>
            <input
              id="image"
              name="image"
              className={styles["file-input"]}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageChange}
            />

            <label htmlFor="image" className={styles["file-input-label"]}>
              Wählen
            </label>
          </div>
          {selectedImage && (
            <>
              <span className={styles["file-name"]}>{selectedImage.name}</span>
            </>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className="delete-button"
          >
            <img width={24} height={24} src="/assets/trash.svg" alt="trash" />
          </button>
          <div className={`warn-txt ${styles["warn-txt-hight"]}`}>
            {formErrors.image}
          </div>
        </div>

        {loading ? <PreLoader /> : <></>}

        <div className={styles["btn-container"]}>
          <button
            type="submit"
            className={`main-quiz-button ${styles["save-btn"]}`}
            disabled={!selectedImage && !imageDeleted}
          >
            Foto speichern
          </button>
        </div>
      </form>
    </section>
  );
}

export default ChangeProfileImage;
