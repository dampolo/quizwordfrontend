import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Snackbar } from "react-native-paper";
import { useAuth } from "../../../context/auth/useAuth";
import ScreenHeaderCustomer from "../../ScreenHeaderCustomer/ScreenHeaderCustomer";
import { styles } from "../../../styles/styles";
import MailIcon from "../../../../assets/icons/mail-icon-input-field.svg";
import LockIcon from "../../../../assets/icons/pwd-lock-icon-input-field.svg";
import EyeIcon from "../../../../assets/icons/eye.svg";
import EyeOffIcon from "../../../../assets/icons/eye-off.svg";
import { auth } from "../../../styles/auth";
import { changeEmailStyles } from "./change-email.styles";

function errorText(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string").join("\n")
    : typeof value === "string"
      ? value
      : "";
}


export default function ChangeEmail() {
  const { profile, postChangeEmail, setConfirmationMessage, logout } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [changed, setChanged] = useState(false);
  const busyRef = useRef(false);
  const emailChangedRef = useRef(false);
  const successMessageRef = useRef("");
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const PasswordIcon = passwordVisible ? EyeIcon : EyeOffIcon;


  function changeEmail(value) {
    setEmail(value);
    setErrors((previous) => ({ ...previous, new_email: "" }));
  }


  function changePassword(value) {
    setPassword(value);
    setErrors((previous) => ({ ...previous, password: "" }));
  }


  function returnToProfile() {
    if (!busyRef.current && !emailChangedRef.current) {
      router.navigate("/my-quiz/profile");
    }
  }


  async function save() {
    if (busyRef.current) {
      return;
    }
    if (!emailChangedRef.current) {
      const validation = {};
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim())) {
        validation.new_email = "Bitte gib eine gültige E-Mail-Adresse ein.";
      }
      if (!password) {
        validation.password = "Bitte gib dein aktuelles Passwort ein.";
      }
      setErrors(validation);
      if (Object.keys(validation).length) {
        setNotice(validation.new_email || validation.password);
        (validation.new_email ? emailRef : passwordRef).current?.focus();
        return;
      }
    }
    busyRef.current = true;
    setBusy(true);
    setNotice("");
    try {
      if (!emailChangedRef.current) {
        const result = await postChangeEmail({
          new_email: email.trim(),
          password,
        });
        emailChangedRef.current = true;
        setChanged(true);
        setPassword("");
        successMessageRef.current =
          errorText(result?.detail) ||
          "Deine E-Mail-Adresse wurde erfolgreich geändert.";
        setConfirmationMessage(successMessageRef.current);
      }
      await logout();
      router.replace("/quiz/(auth)/confirmation");
    } catch (failure) {
      if (emailChangedRef.current) {
        setNotice(
          "Deine E-Mail-Adresse wurde geändert. Die Abmeldung ist fehlgeschlagen. Bitte tippe auf Erneut abmelden.",
        );
      } else {
        const data = failure?.response?.data ?? failure?.response;
        const fieldErrors = {
          new_email: errorText(data?.new_email),
          password: errorText(data?.password),
        };
        setErrors(fieldErrors);
        setNotice(
          fieldErrors.new_email ||
            fieldErrors.password ||
            errorText(data?.detail) ||
            errorText(data?.non_field_errors) ||
            "Die E-Mail-Adresse konnte nicht geändert werden. Bitte versuche es erneut.",
        );
        (fieldErrors.new_email ? emailRef : passwordRef).current?.focus();
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <SafeAreaView
      style={changeEmailStyles.screen}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScreenHeaderCustomer
        horizontalInset={0}
        title="E-Mail-Adresse ändern"
        fallbackHref="/my-quiz/profile"
      />
      <KeyboardAvoidingView
        style={changeEmailStyles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={changeEmailStyles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={changeEmailStyles.card}>
            <Text accessibilityRole="header" style={changeEmailStyles.title}>
              E-Mail-Adresse ändern
            </Text>
            <Text style={changeEmailStyles.body}>
              Gib deine neue E-Mail-Adresse und dein aktuelles Passwort ein.
              Nach der Änderung wirst du abgemeldet und kannst dich mit der
              neuen Adresse anmelden.
            </Text>
            <Text style={changeEmailStyles.body}>
              Aktuelle E-Mail-Adresse: {profile?.email || "–"}
            </Text>
            <View style={changeEmailStyles.field}>
              <Text style={changeEmailStyles.label}>
                Deine neue E-Mail-Adresse
              </Text>
              <View style={changeEmailStyles.inputContainer}>
              <TextInput
                ref={emailRef}
                testID="change-email-new_email"
                accessibilityLabel="Deine neue E-Mail-Adresse"
                value={email}
                onChangeText={changeEmail}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                editable={!busy && !changed}
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                style={[
                  changeEmailStyles.input,
                  focusedField === "email" && auth.inputFieldFocus,
                  !!errors.new_email && changeEmailStyles.invalidInput,
                ]}
              />
                <View pointerEvents="none" accessible={false} style={changeEmailStyles.inputIcon}>
                  <MailIcon width={24} height={24} />
                </View>
              </View>
              {!!errors.new_email && (
                <Text accessibilityRole="alert" style={changeEmailStyles.error}>
                  {errors.new_email}
                </Text>
              )}
            </View>
            <View style={changeEmailStyles.field}>
              <Text style={changeEmailStyles.label}>Aktuelles Passwort</Text>
              <View style={changeEmailStyles.inputContainer}>
              <TextInput
                ref={passwordRef}
                testID="change-email-password"
                accessibilityLabel="Aktuelles Passwort"
                value={password}
                onChangeText={changePassword}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                editable={!busy && !changed}
                secureTextEntry={!passwordVisible}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={save}
                style={[
                  changeEmailStyles.input,
                  focusedField === "password" && auth.inputFieldFocus,
                  !!errors.password && changeEmailStyles.invalidInput,
                ]}
              />
                <View pointerEvents="none" accessible={false} style={changeEmailStyles.inputIcon}>
                  <LockIcon width={24} height={24} />
                </View>
              <Pressable
                testID="change-email-toggle-password"
                accessibilityRole="button"
                accessibilityLabel={
                  passwordVisible ? "Passwort verbergen" : "Passwort anzeigen"
                }
                disabled={busy || changed}
                onPress={() => setPasswordVisible((previous) => !previous)}
                style={({ pressed }) => [
                  changeEmailStyles.toggle,
                  pressed && styles.pressed,
                ]}
              >
                <PasswordIcon width={24} height={24} />
              </Pressable>
              </View>
              {!!errors.password && (
                <Text accessibilityRole="alert" style={changeEmailStyles.error}>
                  {errors.password}
                </Text>
              )}
            </View>
            <Pressable
              testID="save-email"
              accessibilityRole="button"
              accessibilityState={{ disabled: busy, busy }}
              disabled={busy}
              onPress={save}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
                busy && styles.buttonDisabled,
              ]}
            >
              {busy ? (
                <ActivityIndicator accessibilityLabel="E-Mail-Adresse wird geändert" />
              ) : (
                <Text style={styles.buttonText}>
                  {changed ? "Erneut abmelden" : "Ändern"}
                </Text>
              )}
            </Pressable>
            <Pressable
              testID="cancel-change-email"
              accessibilityRole="button"
              disabled={busy || changed}
              onPress={returnToProfile}
              style={({ pressed }) => [
                styles.button,
                styles.secondary,
                pressed && styles.pressed,
                (busy || changed) && styles.buttonDisabled,
              ]}
            >
              <Text style={[styles.buttonText, styles.secondaryText]}>
                Zurück zum Profil
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Snackbar
        visible={!!notice}
        onDismiss={() => setNotice("")}
        action={{ label: "OK", onPress: () => setNotice("") }}
      >
        {notice}
      </Snackbar>
    </SafeAreaView>
  );
}
