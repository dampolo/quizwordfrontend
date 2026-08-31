import { Link } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import useVocabulary from "../../../context/useVocabulary";
import "./profile.scss";
import EditButton from "../../../components/EditButton/EditButon";
import BackButton from "../../../components/BackButton/BackButton";
import PreLoader from "../../../components/PreLoader/PreLoader";
import { useEffect } from "react";

const InfoRow = ({ label, value, type }) => {
  const renderValue = () => {
    if (typeof value === "boolean") {
      return value ? "✅" : "❌";
    }

    if (type === "password") {
      return "*".repeat(10);
    }

    return value || "-";
  };

  return (
    <div className="profile-user__row">
      <span className="profile-user__label">{label}</span>
      <span className="profile-user__value">{renderValue()}</span>
    </div>
  );
};

function Profile() {
  const { profile, getProfile } = useAuth();
  const { userLanguages, nativeLanguage } = useVocabulary();

  useEffect(() => {
    getProfile();
  }, []);

  if (!profile) {
    return (
      <div className="show-container ">
        <PreLoader />
      </div>
    );
  }

  return (
    <div className="profile-user">
      <BackButton to="/my-quiz/all-words/" />
      <h1 className="title">Profile</h1>

      {/* IMAGE */}
      <h2 className="features-title">Foto:</h2>
      <div className="profile-user__card">
        <img className="profile-user__avatar" width={100} height={100} src={profile?.image || "/assets/profile.svg"} alt={`Profilbild von ${profile?.username || "Benutzer" }`} />
        <EditButton to="/my-quiz/change-profile-image" className="edit-button" />
      </div>
      {/* IMAGE Ende */}

      <h2 className="features-title">Deine Daten:</h2>
      <div className="profile-user__card">
        <InfoRow label="Customer Number:" value={profile.customer_number} />

        <InfoRow label="Title:" value={profile.title} />

        <InfoRow label="First Name:" value={profile.first_name} />

        <InfoRow label="Last Name:" value={profile.last_name} />

        <InfoRow label="Phone:" value={profile.phone} />

        <InfoRow label="Street:" value={profile.street} />

        <InfoRow label="Street number:" value={profile.street_number} />

        <InfoRow label="City:" value={profile.city} />

        <InfoRow label="Postal Code:" value={profile.postcode} />

        <InfoRow label="Subscription:" value={profile.has_subscription} />

        <InfoRow label="Description:" value={profile.description} />

        <InfoRow label="Active:" value={profile.is_active} />

        <InfoRow
          label="Created:"
          value={
            profile.created_at
              ? new Date(profile.created_at).toLocaleDateString()
              : "-"
          }
        />
        <EditButton to="/my-quiz/edit-profile" className="edit-button" />
      </div>

      <h2 className="features-title">Username ändern:</h2>
      <div className="profile-user__card">
        <InfoRow label="Username:" value={profile.username} />
        <EditButton to="/my-quiz/change-username" className="edit-button" />
      </div>

      <h2 className="features-title">E-Mail-Adresse ändern:</h2>
      <div className="profile-user__card">
        <InfoRow label="E-Mail:" value={profile.email} />
        <EditButton to="/my-quiz/change-email" className="edit-button" />
      </div>

      <h2 className="features-title">Passwort ändern:</h2>
      <div className="profile-user__card">
        <InfoRow label="Passwort:" value={profile.password} type="password" />
        <EditButton to="/my-quiz/change-password" className="edit-button" />
      </div>

      <h2 className="features-title">Deine Sprachen</h2>
      <div className="profile-user__card">
        <div className="profile-user__row">
          <span className="profile-user__label">Deine Muttersprache:</span>
          <span className="profile-user__value">
            {nativeLanguage?.language_name}
          </span>
        </div>

        <div className="profile-user__row">
          <span className="profile-user__label">Deine Lernsprachen:</span>
          <ul>
            {userLanguages.map((lang) => (
              <li className="profile-user__value" key={lang.id}>
                {lang.language_name}
              </li>
            ))}
          </ul>
        </div>
        <EditButton
          to={`/my-quiz/edit-languages?redirect=true`}
          className="edit-button"
        />
      </div>

      <h2 className="features-title">Lösche dein Konto:</h2>
      <div className="profile-user__card">
        <p>
          Wenn du dein Konto löschst, werden alle deine Wörter, Quizze,
          Kategorien entfernt. Diese Aktion kann nicht rückgängig gemacht
          werden.
        </p>
        <Link
          to="/my-quiz/delete-account"
          className="main-quiz-button delete-btn"
        >
          {" "}
          Lösche dein Konto
        </Link>
      </div>
    </div>
  );
}

export default Profile;
