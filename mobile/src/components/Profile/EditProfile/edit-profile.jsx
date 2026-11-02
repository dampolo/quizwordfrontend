import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Snackbar } from "react-native-paper";
import { useAuth } from "../../../context/auth/useAuth";
import PreLoader from "../../PreLoader/pre-loader";
import ScreenHeaderCustomer from "../../ScreenHeaderCustomer/ScreenHeaderCustomer";
import { styles } from "../../../styles/styles";
import { editProfileStyles } from "./edit-profile.styles";

function errorText(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string").join("\n")
    : typeof value === "string"
      ? value
      : "";
}

function ReadOnlyRow({ label, value }) {
  return (
    <View style={editProfileStyles.field}>
      <Text style={editProfileStyles.label}>{label}</Text>
      <Text selectable style={editProfileStyles.body}>
        {typeof value === "boolean"
          ? value
            ? "Ja"
            : "Nein"
          : String(value ?? "").trim() || "–"}
      </Text>
    </View>
  );
}

export default function EditProfile() {
  const { profile, updateProfile } = useAuth();
  const [focusedField, setFocusedField] = useState(null);
  const [changes, setForm] = useState({});
  const form = {
    title: profile?.title || "",
    first_name: String(profile?.first_name ?? ""),
    last_name: String(profile?.last_name ?? ""),
    phone: String(profile?.phone ?? ""),
    street: String(profile?.street ?? ""),
    street_number: String(profile?.street_number ?? ""),
    city: String(profile?.city ?? ""),
    postcode: String(profile?.postcode ?? ""),
    has_subscription: Boolean(profile?.has_subscription),
    ...changes,
  };
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const busyRef = useRef(false);
  const inputsRef = useRef({});

  function changeField(name, value) {
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  }

  function returnToProfile() {
    if (!busyRef.current) {
      router.navigate("/my-quiz/profile");
    }
  }

  async function save() {
    if (busyRef.current) {
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setErrors({});
    setNotice("");
    try {
      await updateProfile(form);
      setNotice("Dein Profil wurde aktualisiert!");
    } catch (failure) {
      const data = failure?.response?.data ?? failure?.response;
      const fieldErrors =
        data && typeof data === "object" && !Array.isArray(data) ? data : {};
      setErrors(fieldErrors);
      const message =
        errorText(fieldErrors.detail) ||
        errorText(fieldErrors.non_field_errors) ||
        Object.keys(form)
          .map((name) => errorText(fieldErrors[name]))
          .filter(Boolean)
          .join("\n") ||
        (typeof data === "string"
          ? data
          : "Das Profil konnte nicht gespeichert werden. Bitte versuche es erneut.");
      setNotice(message);
      const invalidField = Object.keys(inputsRef.current).find(
        (name) => fieldErrors[name],
      );
      if (invalidField) {
        inputsRef.current[invalidField]?.focus();
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <SafeAreaView
      style={editProfileStyles.screen}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        style={editProfileStyles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={editProfileStyles.content}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenHeaderCustomer
            title="Profil bearbeiten"
            fallbackHref="/my-quiz/profile"
          />
          <View style={editProfileStyles.card}>
            <Text accessibilityRole="header" style={editProfileStyles.title}>
              Deine Daten bearbeiten
            </Text>
            <ReadOnlyRow
              label="Kundennummer"
              value={profile?.customer_number}
            />
            <ReadOnlyRow label="Benutzername" value={profile?.username} />
            <View style={editProfileStyles.field}>
              <Text style={editProfileStyles.label}>Anrede</Text>
              <View style={editProfileStyles.options}>
                {["Herr", "Frau", "Divers"].map((title) => (
                  <Pressable
                    key={title}
                    testID={`edit-profile-title-${title}`}
                    accessibilityRole="radio"
                    accessibilityState={{
                      checked: form.title === title,
                      disabled: busy,
                    }}
                    disabled={busy}
                    onPress={() => changeField("title", title)}
                    style={({ pressed }) => [
                      editProfileStyles.option,
                      form.title === title && editProfileStyles.selectedOption,
                      pressed && !busy && styles.pressed,
                    ]}
                  >
                    <Text style={editProfileStyles.label}>{title}</Text>
                  </Pressable>
                ))}
              </View>
              {!!errorText(errors.title) && (
                <Text accessibilityRole="alert" style={editProfileStyles.error}>
                  {errorText(errors.title)}
                </Text>
              )}
            </View>
            <View style={editProfileStyles.field}>
              <Text style={editProfileStyles.label}>Vorname</Text>
              <TextInput
                ref={(input) => {
                  inputsRef.current.first_name = input;
                }}
                testID="edit-profile-first_name"
                accessibilityLabel="Vorname"
                value={form.first_name}
                onChangeText={(value) => changeField("first_name", value)}
              onFocus={() => setFocusedField("first_name")}
              onBlur={() => setFocusedField(null)}
                editable={!busy}
                autoComplete="given-name"
                style={[
                  editProfileStyles.input,
                  focusedField === "first_name" && styles.inputFieldFocus,
                !!errors.first_name && editProfileStyles.invalidInput,
                ]}
              />
              {!!errorText(errors.first_name) && (
                <Text accessibilityRole="alert" style={editProfileStyles.error}>
                  {errorText(errors.first_name)}
                </Text>
              )}
            </View>
            <View style={editProfileStyles.field}>
              <Text style={editProfileStyles.label}>Nachname</Text>
              <TextInput
                ref={(input) => {
                  inputsRef.current.last_name = input;
                }}
                testID="edit-profile-last_name"
                accessibilityLabel="Nachname"
                value={form.last_name}
                onChangeText={(value) => changeField("last_name", value)}
              onFocus={() => setFocusedField("last_name")}
              onBlur={() => setFocusedField(null)}
                editable={!busy}
                autoComplete="family-name"
                style={[
                  editProfileStyles.input,
                  focusedField === "last_name" && styles.inputFieldFocus,
                !!errors.last_name && editProfileStyles.invalidInput,
                ]}
              />
              {!!errorText(errors.last_name) && (
                <Text accessibilityRole="alert" style={editProfileStyles.error}>
                  {errorText(errors.last_name)}
                </Text>
              )}
            </View>
            <View style={editProfileStyles.field}>
              <Text style={editProfileStyles.label}>Telefon</Text>
              <TextInput
                ref={(input) => {
                  inputsRef.current.phone = input;
                }}
                testID="edit-profile-phone"
                accessibilityLabel="Telefon"
                value={form.phone}
                onChangeText={(value) => changeField("phone", value)}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
                editable={!busy}
                autoComplete="tel"
                keyboardType="phone-pad"
                style={[
                  editProfileStyles.input,
                  focusedField === "phone" && styles.inputFieldFocus,
                !!errors.phone && editProfileStyles.invalidInput,
                ]}
              />
              {!!errorText(errors.phone) && (
                <Text accessibilityRole="alert" style={editProfileStyles.error}>
                  {errorText(errors.phone)}
                </Text>
              )}
            </View>
            <View style={editProfileStyles.field}>
              <Text style={editProfileStyles.label}>Straße</Text>
              <TextInput
                ref={(input) => {
                  inputsRef.current.street = input;
                }}
                testID="edit-profile-street"
                accessibilityLabel="Straße"
                value={form.street}
                onChangeText={(value) => changeField("street", value)}
              onFocus={() => setFocusedField("street")}
              onBlur={() => setFocusedField(null)}
                editable={!busy}
                autoComplete="street-address"
                style={[
                  editProfileStyles.input,
                  focusedField === "street" && styles.inputFieldFocus,
                !!errors.street && editProfileStyles.invalidInput,
                ]}
              />
              {!!errorText(errors.street) && (
                <Text accessibilityRole="alert" style={editProfileStyles.error}>
                  {errorText(errors.street)}
                </Text>
              )}
            </View>
            <View style={editProfileStyles.field}>
              <Text style={editProfileStyles.label}>Hausnummer</Text>
              <TextInput
                ref={(input) => {
                  inputsRef.current.street_number = input;
                }}
                testID="edit-profile-street_number"
                accessibilityLabel="Hausnummer"
                value={form.street_number}
                onChangeText={(value) => changeField("street_number", value)}
              onFocus={() => setFocusedField("street_number")}
              onBlur={() => setFocusedField(null)}
                editable={!busy}
                style={[
                  editProfileStyles.input,
                  focusedField === "street_number" && styles.inputFieldFocus,
                !!errors.street_number && editProfileStyles.invalidInput,
                ]}
              />
              {!!errorText(errors.street_number) && (
                <Text accessibilityRole="alert" style={editProfileStyles.error}>
                  {errorText(errors.street_number)}
                </Text>
              )}
            </View>
            <View style={editProfileStyles.field}>
              <Text style={editProfileStyles.label}>Stadt</Text>
              <TextInput
                ref={(input) => {
                  inputsRef.current.city = input;
                }}
                testID="edit-profile-city"
                accessibilityLabel="Stadt"
                value={form.city}
                onChangeText={(value) => changeField("city", value)}
              onFocus={() => setFocusedField("city")}
              onBlur={() => setFocusedField(null)}
                editable={!busy}
                style={[
                  editProfileStyles.input,
                  focusedField === "city" && styles.inputFieldFocus,
                !!errors.city && editProfileStyles.invalidInput,
                ]}
              />
              {!!errorText(errors.city) && (
                <Text accessibilityRole="alert" style={editProfileStyles.error}>
                  {errorText(errors.city)}
                </Text>
              )}
            </View>
            <View style={editProfileStyles.field}>
              <Text style={editProfileStyles.label}>Postleitzahl</Text>
              <TextInput
                ref={(input) => {
                  inputsRef.current.postcode = input;
                }}
                testID="edit-profile-postcode"
                accessibilityLabel="Postleitzahl"
                value={form.postcode}
                onChangeText={(value) => changeField("postcode", value)}
              onFocus={() => setFocusedField("postcode")}
              onBlur={() => setFocusedField(null)}
                editable={!busy}
                autoComplete="postal-code"
                keyboardType="number-pad"
                style={[
                  editProfileStyles.input,
                  focusedField === "postcode" && styles.inputFieldFocus,
                !!errors.postcode && editProfileStyles.invalidInput,
                ]}
              />
              {!!errorText(errors.postcode) && (
                <Text accessibilityRole="alert" style={editProfileStyles.error}>
                  {errorText(errors.postcode)}
                </Text>
              )}
            </View>
            <View style={editProfileStyles.field}>
              <View style={editProfileStyles.switchRow}>
                <Text style={editProfileStyles.label}>Abonnement</Text>
                <Switch
                  testID="edit-profile-has_subscription"
                  accessibilityLabel="Abonnement"
                  value={form.has_subscription}
                  disabled={busy}
                  onValueChange={(value) =>
                    changeField("has_subscription", value)
                  }
                />
              </View>
              {!!errorText(errors.has_subscription) && (
                <Text accessibilityRole="alert" style={editProfileStyles.error}>
                  {errorText(errors.has_subscription)}
                </Text>
              )}
            </View>
            <ReadOnlyRow label="Aktiv" value={profile?.is_active} />
            <ReadOnlyRow
              label="Erstellt am"
              value={
                profile?.created_at
                  ? new Date(profile?.created_at).toLocaleDateString()
                  : null
              }
            />

            {busy && <PreLoader />}
            <Pressable
              testID="save-profile"
              accessibilityRole="button"
              accessibilityState={{ disabled: busy, busy }}
              disabled={busy}
              onPress={save}
              style={({ pressed }) => [
                styles.button,
                pressed && !busy && styles.pressed,
                busy && styles.buttonDisabled,
              ]}
            >
              <Text style={[styles.buttonText, busy && styles.buttonTextDisabled]}>Speichern</Text>
            </Pressable>
            <Pressable
              testID="cancel-edit-profile"
              accessibilityRole="button"
              disabled={busy}
              onPress={returnToProfile}
              style={({ pressed }) => [
                styles.button,
                styles.secondary,
                pressed && !busy && styles.pressed,
                busy && styles.buttonDisabled,
              ]}
            >
              <Text style={[styles.buttonText, styles.secondaryText, busy && styles.buttonTextDisabled]}>
                Zurück zum Profil
              </Text>
            </Pressable>
          </View>
        </ScrollView>
        <Snackbar
          visible={!!notice}
          onDismiss={() => setNotice("")}
          action={{ label: "OK", onPress: () => setNotice("") }}
        >
          {notice}
        </Snackbar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
