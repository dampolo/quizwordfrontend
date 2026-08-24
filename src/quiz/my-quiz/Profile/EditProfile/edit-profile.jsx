import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./edit-profile.scss";
import { useAuth } from "../../../../context/useAuth";
import BackButton from "../../../../components/BackButton/BackButton";
import PreLoader from "../../../../components/PreLoader/PreLoader";
import { toast } from "react-toastify";

function InfoRow({
  label,
  value,
  name,
  type = "text",
  onChange,
  isReadOnly = false,
  error,
}) {
  const renderValue = () => {
    if (typeof value === "boolean") {
      return value ? "✅" : "❌";
    }

    return value || "-";
  };

  return (
    <div className="profile-user__single">
      <div className="profile-user__row">
        {isReadOnly ? (
          <span className="profile-user__label">{label}</span>
        ) : (
          <label htmlFor={name} className="profile-user__label">
            {label}
          </label>
        )}

        {isReadOnly ? (
          <span className="profile-user__value">{renderValue()}</span>
        ) : type === "checkbox" ? (
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={Boolean(value)}
            onChange={onChange}
            className="profile-user__checkbox"
          />
        ) : type === "select" ? (
          <select
            id={name}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            className="profile-user__input input-select"
          >
            <option value="Herr">Herr</option>
            <option value="Frau">Frau</option>
            <option value="Divers">Divers</option>
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value ?? ""}
            onChange={onChange}
            className="profile-user__input input-field"
          />
        )}
      </div>
      {error && <p className="warn-txt warn-profile">{error}</p>}
    </div>
  );
}

function EditProfile() {
  const { profile, updateProfile } = useAuth();
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id: "",
    title: "",
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    street: "",
    street_number: "",
    city: "",
    postcode: "",
    has_subscription: "",
    description: "",
    is_active: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        id: profile.id,
        title: profile.title || "",
        username: profile.username,
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        street: profile.street || "",
        street_number: profile.street_number || "",
        city: profile.city || "",
        postcode: profile.postcode || "",
        has_subscription: profile.has_subscription,
        description: profile.description || "",
        is_active: profile.is_active,
      });
    }
  }, [profile]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setErrors({});
      await updateProfile(form);
      toast.success("Dein Profil wurde aktualisiert!");
      navigate(
        `/my-quiz/profile`,
      );
    } catch (error) {
      if (error.response?.data) {
        toast.error("Verusche noch einmal!");
        setErrors(error.response.data);
      } else {
        console.error(error);
      }
    }
  }

  if (!profile) {
    return (
      <div className="show-container ">
        <PreLoader />
      </div>
    );
  }

  return (
    <div className="profile-user">
      <h1 className="title">Edit Profil</h1>

      <form className="profile-user__card" onSubmit={handleSubmit}>
        <BackButton to="/my-quiz/profile/" />
        <InfoRow
          label="Customer Number:"
          value={profile.customer_number}
          isReadOnly
        />

        <InfoRow 
          label="User name:" 
          value={profile.username} 
          isReadOnly 
        />

        <InfoRow
          label="Title:"
          name="title"
          type="select"
          value={form.title}
          onChange={handleChange}
        />

        <InfoRow
          label="First Name:"
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
        />

        <InfoRow
          label="Last Name:"
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
        />

        <InfoRow
          label="Phone:"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />

        <InfoRow
          label="Street:"
          name="street"
          value={form.street}
          onChange={handleChange}
        />

        <InfoRow
          label="Street Number:"
          name="street_number"
          value={form.street_number}
          onChange={handleChange}
        />

        <InfoRow
          label="City:"
          name="city"
          value={form.city}
          onChange={handleChange}
        />

        <InfoRow
          label="Postal Code:"
          name="postcode"
          value={form.postcode}
          onChange={handleChange}
          error={errors.postcode?.[0]}
        />

        <InfoRow
          label="Subscription"
          name="has_subscription"
          type="checkbox"
          value={form.has_subscription}
          onChange={handleChange}
        />

        <div className="profile-user__row">
          <label className="profile-user__label">Description:</label>

          <textarea
            className="profile-user__textarea"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <InfoRow
          label="Active"
          name="is_active"
          type="checkbox"
          value={form.is_active}
          isReadOnly
        />

        <InfoRow
          label="Created:"
          value={
            profile.created_at
              ? new Date(profile.created_at).toLocaleDateString()
              : "-"
          }
          isReadOnly
        />      
        <div className="action-buttons">
          <Link to="/my-quiz/profile" className="main-quiz-button-cancel">
            Zurück
          </Link>
          <button type="submit" className="main-quiz-button">
            Speichern
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
