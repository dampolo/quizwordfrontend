import { useRef, useState } from "react";
import { Link, router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/auth/useAuth";
import PreLoader from "../../../components/PreLoader/pre-loader";
import { auth, authCompact, authCompactWidth } from "../../../styles/auth";
import { resets } from "../../../styles/resets";
import { styles } from "../../../styles/styles";
import MailIcon from "../../../../assets/icons/mail-icon-input-field.svg";
import LockIcon from "../../../../assets/icons/pwd-lock-icon-input-field.svg";
import EyeIcon from "../../../../assets/icons/eye.svg";
import EyeOffIcon from "../../../../assets/icons/eye-off.svg";
import ScreenHeader from "../../../components/ScreenHeader/screen-header";

export default function LoginQuiz() {
  const initialValues = { email: "", password: "" };
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const passwordRef = useRef(null);
  const { login, loading } = useAuth();
  const compact = useWindowDimensions().width <= authCompactWidth;
  const busy = loading || submitting;
  const PasswordIcon = isPasswordVisible ? EyeIcon : EyeOffIcon;

  function handleChange(name, value) {
    setFormValues((previousValues) => ({ ...previousValues, [name]: value }));
  }

  async function handleSubmit() {
    if (loading || submittingRef.current) return;
    const errors = validate(formValues);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    await loginWithEmailAndPassword();
  }

  async function loginWithEmailAndPassword() {
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const response = await login(formValues.email.trim(), formValues.password);
      if (response) router.replace("/my-quiz/all-words");
      else
        setFormErrors({
          message: "Anmeldung fehlgeschlagen. Bitte versuche es erneut.",
        });
    } catch (error) {
      const detail = error?.response?.data?.detail || error?.response?.detail;
      setFormErrors({
        message: typeof detail === "string" ? detail : "Login Fehler",
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  function validate(values) {
    const errors = {};

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    if (!values.email || !regexEmail.test(values.email.trim())) {
      errors.email = "Dein E-Mail ist unvollständig/inkorrekt.";
    }

    if (!values.password) {
      errors.password = "Dein Passwort ist nicht korrekt.";
    }

    return errors;
  }

  function handleEmailChange(value) {
    handleChange("email", value);
  }

  function handlePasswordChange(value) {
    handleChange("password", value);
  }

  function handleEmailFocus() {
    setFocusedField("email");
  }

  function handlePasswordFocus() {
    setFocusedField("password");
  }

  function handleBlur() {
    setFocusedField(null);
  }

  function focusPassword() {
    passwordRef.current?.focus();
  }

  function togglePasswordVisibility() {
    setIsPasswordVisible((visible) => !visible);
  }

  function getEyeButtonStyle({ pressed }) {
    return [auth.eyeButton, pressed && auth.pressed];
  }

  function getSubmitStyle({ pressed }) {
    return [styles.button, pressed && !busy && auth.pressed, busy && styles.buttonDisabled];
  }

  const keyboardBehavior = Platform.OS === "ios" ? "padding" : "height";
  const mainAuthStyle = [auth.mainAuth, compact && authCompact.mainAuth];
  const contentStyle = [auth.mainContentCustomer, compact && authCompact.mainContentCustomer];
  const emailInputStyle = [auth.inputField, compact && authCompact.inputField, focusedField === "email" && auth.inputFieldFocus];
  const passwordInputStyle = [auth.inputField, compact && authCompact.inputField, focusedField === "password" && auth.inputFieldFocus];
  const inputIconStyle = [auth.inputIcon, compact && authCompact.inputIcon];
  const submitTextStyle = [styles.buttonText, busy && styles.buttonTextDisabled];
  const passwordVisibilityLabel = isPasswordVisible ? "Passwort verstecken" : "Passwort zeigen";
  const passwordHidden = !isPasswordVisible;
  const inputsEditable = !busy;
  const passwordError = formErrors.password || formErrors.message;

  return (
    <SafeAreaView style={resets.screen} edges={["bottom"]}>
      <ScreenHeader title="" />
      <KeyboardAvoidingView
        style={resets.screen}
        behavior={keyboardBehavior}
      >
        <ScrollView
          contentContainerStyle={mainAuthStyle}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={contentStyle}
          >
            <View style={auth.formTitle}>
              <Text accessibilityRole="header" style={auth.formTitleName}>
                Anmeldung
              </Text>
            </View>
            <Text style={auth.description}>
              Wir empfehlen dir, die E-Mail-Adresse zu nutzen, die du bei der
              Arbeit verwendest.
            </Text>
            <Text style={auth.description}>
              Hast du kein Konto?{" "}
              <Link href="/quiz/(auth)/create-account" style={auth.newUserLink}>
                Konto erstellen
              </Link>
            </Text>
            <View style={auth.form}>
              <View style={auth.inputContainer}>
                <Text nativeID="login-email-label" style={auth.inputLabel}>
                  E-Mail-Adresse
                </Text>
                <TextInput
                  testID="login-email"
                  accessibilityLabel="E-Mail-Adresse"
                  accessibilityLabelledBy="login-email-label"
                  style={emailInputStyle}
                  placeholder="beispielname@email.com"
                  autoComplete="email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={inputsEditable}
                  returnKeyType="next"
                  submitBehavior="submit"
                  value={formValues.email}
                  onChangeText={handleEmailChange}
                  onFocus={handleEmailFocus}
                  onBlur={handleBlur}
                  onSubmitEditing={focusPassword}
                />
                <View
                  pointerEvents="none"
                  style={inputIconStyle}
                >
                  <MailIcon width={24} height={24} />
                </View>
                <Text accessibilityLiveRegion="polite" style={auth.warnText}>
                  {formErrors.email}
                </Text>
              </View>
              <View style={auth.inputContainer}>
                <Text nativeID="login-password-label" style={auth.inputLabel}>
                  Passwort
                </Text>
                <TextInput
                  ref={passwordRef}
                  testID="login-password"
                  accessibilityLabel="Passwort"
                  accessibilityLabelledBy="login-password-label"
                  style={passwordInputStyle}
                  placeholder="Passwort"
                  autoComplete="current-password"
                  secureTextEntry={passwordHidden}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={inputsEditable}
                  returnKeyType="go"
                  value={formValues.password}
                  onChangeText={handlePasswordChange}
                  onFocus={handlePasswordFocus}
                  onBlur={handleBlur}
                  onSubmitEditing={handleSubmit}
                />
                <View
                  pointerEvents="none"
                  style={inputIconStyle}
                >
                  <LockIcon width={24} height={24} />
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={passwordVisibilityLabel}
                  onPress={togglePasswordVisibility}
                  style={getEyeButtonStyle}
                >
                  <PasswordIcon width={24} height={24} />
                </Pressable>
                <Text
                  accessibilityLiveRegion="polite"
                  style={[auth.warnText, auth.warnTxtHight]}
                >
                  {passwordError}
                </Text>
              </View>
              {busy && <PreLoader />}
              <View style={auth.btnContainer}>
                <Pressable
                  testID="login-submit"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: busy, busy }}
                  disabled={busy}
                  onPress={handleSubmit}
                  style={getSubmitStyle}
                >
                  <Text style={submitTextStyle}>Anmelden</Text>
                </Pressable>
              </View>
              <Link href="/quiz/(auth)/forgot-password" asChild>
                <Pressable style={auth.btnPassword}>
                  <Text style={auth.btnPasswordText}>Passwort vergessen?</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
