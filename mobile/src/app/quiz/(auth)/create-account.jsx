import { useRef, useState } from "react";
import { Link } from "expo-router";
import { Checkbox } from "expo-checkbox";
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
import ScreenHeader from "../../../components/ScreenHeader/screen-header";
import { auth, authCompact, authCompactWidth } from "../../../styles/auth";
import { resets } from "../../../styles/resets";
import { styles } from "../../../styles/styles";
import MailIcon from "../../../../assets/icons/mail-icon-input-field.svg";
import LockIcon from "../../../../assets/icons/pwd-lock-icon-input-field.svg";
import EyeIcon from "../../../../assets/icons/eye.svg";
import EyeOffIcon from "../../../../assets/icons/eye-off.svg";
import { colors } from "../../../styles/basic";


export default function CreateAccount() {
  const initialValues = {
    email: "",
    password: "",
    repeated_password: "",
    checked: false,
  };
  const [touched, setTouched] = useState({});
  const [formValues, setFormValues] = useState(initialValues);
  const [isPasswordTopVisible, togglePasswordVisibilityTop] = useState(false);
  const [isPasswordBottomVisible, togglePasswordVisibilityBottom] =
    useState(false);
  const [formErrors, setFormErrors] = useState({});
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const regexPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%+\-/*?&#])[A-Za-z\d@$!%+\-/*?&#]{10,}$/;

  const { createAccount, loading } = useAuth();
  const [registered, setRegistered] = useState(false);
  const [message, setMessage] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const inputRefs = useRef({});
  const compact = useWindowDimensions().width <= authCompactWidth;
  const busy = loading || submitting;

  const isFormValid = Object.keys(validateInput(formValues)).length === 0;


  async function handleSubmit() {
    if (busy || submittingRef.current || registered) return;

    const errors = validateInput(formValues);

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    await submitAccount(formValues);
  }


  async function submitAccount(values) {
    submittingRef.current = true;
    setSubmitting(true);
    setMessage("");
    try {
      await createAccount(values);
      setRegistered(true);
    } catch (err) {
      const message =
        (err.response?.data || err.response)?.email?.[0] ||
        (err.response?.data || err.response)?.password?.[0] ||
        (err.response?.data || err.response)?.detail ||
        "Account creation failed";

      setMessage(message);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }


  function handleChange(name, value) {
    setFormValues((previousValues) => ({
      ...previousValues,
      [name]: value,
    }));
  }


  function handleBlur(name) {
    setFocusedField(null);

    const newTouched = {
      ...touched,
      [name]: true,
    };

    setTouched(newTouched);
    setFormErrors(validateInput(formValues, newTouched));
  }


  function validateInput(
    values,
    touchedFields = {
      email: true,
      password: true,
      repeated_password: true,
      checked: true,
    },
  ) {
    const errors = {};

    if (touchedFields.email && !regexEmail.test(values.email)) {
      errors.email = "E-Mail ist unvollständig/inkorrekt.";
    }

    if (touchedFields.password && !regexPassword.test(values.password)) {
      errors.password =
        "Mindestens 10 Zeichen erforderlich: ein Klein- u. ein Großbuchstabe, eine Zahl und ein Sonderzeichen.";
    }

    if (
      touchedFields.repeated_password &&
      values.password !== values.repeated_password
    ) {
      errors.notMatch = "Passwörter stimmen nicht überein.";
    }

    if (touchedFields.checked && !values.checked) {
      errors.checked = "Bitte akzeptiere die Datenschutzerklärung.";
    }

    return errors;
  }


  const disabled = !isFormValid || busy;
  const keyboardBehavior = Platform.OS === "ios" ? "padding" : "height";
  const mainAuthStyle = [auth.mainAuth, compact && authCompact.mainAuth];
  const contentStyle = [
    auth.mainContentCustomer,
    compact && authCompact.mainContentCustomer,
  ];
  const inputIconStyle = [auth.inputIcon, compact && authCompact.inputIcon];
  const submitTextStyle = [
    styles.buttonText,
    disabled && styles.buttonTextDisabled,
  ];
  const PasswordVisibilityIcon = isPasswordTopVisible ? EyeIcon : EyeOffIcon;
  const RepeatedPasswordVisibilityIcon = isPasswordBottomVisible
    ? EyeIcon
    : EyeOffIcon;
  const passwordVisibilityLabel = isPasswordTopVisible
    ? "Passwort verstecken"
    : "Passwort zeigen";
  const repeatedPasswordVisibilityLabel = isPasswordBottomVisible
    ? "Wiederholtes Passwort verstecken"
    : "Wiederholtes Passwort zeigen";
  const inputsEditable = !busy;
  const passwordHidden = !isPasswordTopVisible;
  const repeatedPasswordHidden = !isPasswordBottomVisible;


  function getInputStyle(name) {
    return [
      auth.inputField,
      compact && authCompact.inputField,
      focusedField === name && auth.inputFieldFocus,
    ];
  }


  const emailInputStyle = getInputStyle("email");


  function handleEmailChange(value) {
    handleChange("email", value);
  }


  function handleEmailFocus() {
    setFocusedField("email");
  }


  function handleEmailBlur() {
    handleBlur("email");
  }


  const passwordInputStyle = getInputStyle("password");


  function handlePasswordChange(value) {
    handleChange("password", value);
  }


  function handlePasswordFocus() {
    setFocusedField("password");
  }


  function handlePasswordBlur() {
    handleBlur("password");
  }


  function setPasswordRef(input) {
    inputRefs.current.password = input;
  }


  const repeatedPasswordInputStyle = getInputStyle("repeated_password");


  function handleRepeatedPasswordChange(value) {
    handleChange("repeated_password", value);
  }


  function handleRepeatedPasswordFocus() {
    setFocusedField("repeated_password");
  }


  function handleRepeatedPasswordBlur() {
    handleBlur("repeated_password");
  }


  function setRepeatedPasswordRef(input) {
    inputRefs.current.repeated_password = input;
  }


  function focusPassword() {
    inputRefs.current.password?.focus();
  }


  function focusRepeatedPassword() {
    inputRefs.current.repeated_password?.focus();
  }


  function handlePasswordVisibility() {
    togglePasswordVisibilityTop((previous) => !previous);
  }


  function handleRepeatedPasswordVisibility() {
    togglePasswordVisibilityBottom((previous) => !previous);
  }


  function handleConsentChange(checked) {
    handleChange("checked", checked);
    setTouched((previous) => ({ ...previous, checked: true }));
    setFormErrors(
      validateInput({ ...formValues, checked }, { ...touched, checked: true }),
    );
  }


  function getEyeButtonStyle({ pressed }) {
    return [auth.eyeButton, pressed && auth.pressed];
  }


  function getSubmitStyle({ pressed }) {
    return [
      styles.button,
      pressed && !disabled && auth.pressed,
      disabled && styles.buttonDisabled,
    ];
  }


  return (
    <SafeAreaView style={resets.screen} edges={["bottom"]}>
      <ScreenHeader title="" fallbackHref="/quiz/(auth)/login-quiz" />
      <KeyboardAvoidingView style={resets.screen} behavior={keyboardBehavior}>
        <ScrollView
          contentContainerStyle={mainAuthStyle}
          keyboardShouldPersistTaps="handled"
        >
          <View style={contentStyle}>
            <View style={auth.formTitle}>
              <Text accessibilityRole="header" style={auth.formTitleName}>
                Konto erstellen
              </Text>
            </View>
            {registered ? (
              <View style={auth.form}>
                <Text accessibilityLiveRegion="polite" style={auth.description}>
                  Du bist erfolgreich registriert. Um dich anzumelden, musst du
                  deine E-Mail bestätigen!
                </Text>
                <Link href="/quiz/(auth)/login-quiz" asChild>
                  <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>Anmelden</Text>
                  </Pressable>
                </Link>
              </View>
            ) : (
              <>
                <Text style={auth.description}>
                  Hast du schon ein Konto?{" "}
                  <Link href="/quiz/(auth)/login-quiz" style={auth.newUserLink}>
                    Anmelden
                  </Link>
                </Text>
                <View style={auth.form}>
                  <View style={auth.inputContainer}>
                    <Text
                      nativeID="create-account-email-label"
                      style={auth.inputLabel}
                    >
                      Deine E-Mail
                    </Text>
                    <TextInput
                      style={emailInputStyle}
                      value={formValues.email}
                      onChangeText={handleEmailChange}
                      onFocus={handleEmailFocus}
                      onBlur={handleEmailBlur}
                      editable={inputsEditable}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      keyboardType="email-address"
                      returnKeyType="next"
                      submitBehavior="submit"
                      onSubmitEditing={focusPassword}
                      testID="create-account-email"
                      accessibilityLabel="Deine E-Mail"
                      accessibilityLabelledBy="create-account-email-label"
                      placeholder="beispielname@email.com"
                    />
                    <View pointerEvents="none" style={inputIconStyle}>
                      <MailIcon width={24} height={24} />
                    </View>
                    <Text
                      accessibilityLiveRegion="polite"
                      style={auth.warnText}
                    >
                      {formErrors.email}
                    </Text>
                  </View>
                  <View style={auth.inputContainer}>
                    <Text
                      nativeID="create-account-password-label"
                      style={auth.inputLabel}
                    >
                      Passwort
                    </Text>
                    <TextInput
                      style={passwordInputStyle}
                      value={formValues.password}
                      onChangeText={handlePasswordChange}
                      onFocus={handlePasswordFocus}
                      onBlur={handlePasswordBlur}
                      editable={inputsEditable}
                      autoCapitalize="none"
                      autoCorrect={false}
                      ref={setPasswordRef}
                      autoComplete="new-password"
                      secureTextEntry={passwordHidden}
                      returnKeyType="next"
                      submitBehavior="submit"
                      onSubmitEditing={focusRepeatedPassword}
                      testID="create-account-password"
                      accessibilityLabel="Passwort"
                      accessibilityLabelledBy="create-account-password-label"
                      placeholder="Passwort"
                    />
                    <View pointerEvents="none" style={inputIconStyle}>
                      <LockIcon width={24} height={24} />
                    </View>
                    <Pressable
                      testID="create-account-password-visibility"
                      accessibilityRole="button"
                      accessibilityLabel={passwordVisibilityLabel}
                      onPress={handlePasswordVisibility}
                      style={getEyeButtonStyle}
                    >
                      <PasswordVisibilityIcon width={24} height={24} />
                    </Pressable>
                    <Text
                      accessibilityLiveRegion="polite"
                      style={auth.warnText}
                    >
                      {formErrors.password}
                    </Text>
                  </View>
                  <View style={auth.inputContainer}>
                    <Text
                      nativeID="create-account-repeated_password-label"
                      style={auth.inputLabel}
                    >
                      Wiederhole dein Passwort
                    </Text>
                    <TextInput
                      style={repeatedPasswordInputStyle}
                      value={formValues.repeated_password}
                      onChangeText={handleRepeatedPasswordChange}
                      onFocus={handleRepeatedPasswordFocus}
                      onBlur={handleRepeatedPasswordBlur}
                      editable={inputsEditable}
                      autoCapitalize="none"
                      autoCorrect={false}
                      ref={setRepeatedPasswordRef}
                      autoComplete="new-password"
                      secureTextEntry={repeatedPasswordHidden}
                      returnKeyType="done"
                      submitBehavior="blurAndSubmit"
                      onSubmitEditing={handleSubmit}
                      testID="create-account-repeated_password"
                      accessibilityLabel="Wiederhole dein Passwort"
                      accessibilityLabelledBy="create-account-repeated_password-label"
                      placeholder="Wiederhole dein Passwort"
                    />
                    <View pointerEvents="none" style={inputIconStyle}>
                      <LockIcon width={24} height={24} />
                    </View>
                    <Pressable
                      testID="create-account-repeated_password-visibility"
                      accessibilityRole="button"
                      accessibilityLabel={repeatedPasswordVisibilityLabel}
                      onPress={handleRepeatedPasswordVisibility}
                      style={getEyeButtonStyle}
                    >
                      <RepeatedPasswordVisibilityIcon width={24} height={24} />
                    </Pressable>
                    <Text
                      accessibilityLiveRegion="polite"
                      style={auth.warnText}
                    >
                      {formErrors.notMatch}
                    </Text>
                  </View>
                  <View style={auth.checkboxContainer}>
                    <Checkbox
                      color={colors.qwPrimary}
                      testID="create-account-checked"
                      accessibilityRole="checkbox"
                      accessibilityLabel="Ich stimme der Datenschutzerklärung zu."
                      accessibilityState={{
                        checked: formValues.checked,
                        disabled: busy,
                      }}
                      disabled={busy}
                      hitSlop={12}
                      value={formValues.checked}
                      onValueChange={handleConsentChange}
                      style={auth.checkbox}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={auth.checkboxLabel}>
                        Ich stimme der{" "}
                        <Link href="/privacy-policy" style={auth.privacy}>
                          Datenschutzerklärung
                        </Link>{" "}
                        zu.
                      </Text>
                      <Text
                        accessibilityLiveRegion="polite"
                        style={auth.warnText}
                      >
                        {formErrors.checked}
                      </Text>
                    </View>
                  </View>
                  {!!message && (
                    <Text
                      accessibilityRole="alert"
                      accessibilityLiveRegion="polite"
                      style={auth.warnText}
                    >
                      {message}
                    </Text>
                  )}
                  {busy && <PreLoader />}
                  <View style={auth.btnContainer}>
                    <Pressable
                      testID="create-account-submit"
                      accessibilityRole="button"
                      accessibilityState={{ disabled, busy }}
                      disabled={disabled}
                      onPress={handleSubmit}
                      style={getSubmitStyle}
                    >
                      <Text style={submitTextStyle}>Weiter</Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
