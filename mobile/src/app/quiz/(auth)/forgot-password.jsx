import { useRef, useState } from "react";
import { router } from "expo-router";
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


export default function ForgotPassword() {
  const { forgotPassword, setConfirmationMessage, loading } = useAuth();
  const initialValues = { email: "" };
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const isFormValid = regexEmail.test(formValues.email.trim());
  const compact = useWindowDimensions().width <= authCompactWidth;
  const busy = loading || submitting;
  const disabled = !isFormValid || busy;
  const inputsEditable = !busy;
  const keyboardBehavior = Platform.OS === "ios" ? "padding" : "height";
  const mainAuthStyle = [auth.mainAuth, compact && authCompact.mainAuth];
  const contentStyle = [
    auth.mainContentCustomer,
    compact && authCompact.mainContentCustomer,
  ];
  const emailInputStyle = [
    auth.inputField,
    compact && authCompact.inputField,
    focusedField === "email" && auth.inputFieldFocus,
  ];
  const inputIconStyle = [auth.inputIcon, compact && authCompact.inputIcon];
  const submitTextStyle = [
    styles.buttonText,
    disabled && styles.buttonTextDisabled,
  ];


  async function recoveryForm() {
    if (busy || submittingRef.current) return;
    const errors = validateInput(formValues);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      await forgotPassword({ email: formValues.email.trim() });
      setConfirmationMessage("Du kannst jetzt deine E-Mail prüfen.");
      setFormValues(initialValues);
      router.replace("/quiz/(auth)/confirmation");
    } catch (error) {
      const response = error?.response?.data || error?.response;
      const message = response?.email?.[0] || response?.detail;
      setFormErrors({
        message:
          typeof message === "string"
            ? message
            : "Die E-Mail konnte nicht gesendet werden. Bitte versuche es erneut.",
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }


  function handleChange(name, value) {
    const updatedValues = { ...formValues, [name]: value };
    setFormValues(updatedValues);
    setFormErrors(validateInput(updatedValues));
  }


  function validateInput(values) {
    const errors = {};
    if (!regexEmail.test(values.email.trim())) {
      errors.email = "E-Mail ist unvollständig/inkorrekt.";
    }
    return errors;
  }


  function handleEmailChange(value) {
    handleChange("email", value);
  }


  function handleEmailFocus() {
    setFocusedField("email");
  }


  function handleBlur() {
    setFocusedField(null);
  }


  function getSubmitStyle({ pressed }) {
    return [
      styles.button,
      pressed && !disabled && auth.pressed,
      disabled && styles.buttonDisabled,
    ];
  }


  function renderMessage() {
    if (!formErrors.message) return null;
    return (
      <Text
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={auth.warnText}
      >
        {formErrors.message}
      </Text>
    );
  }


  function renderLoader() {
    if (!busy) return null;
    return <PreLoader />;
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
                Passwort vergessen
              </Text>
            </View>
            <View style={auth.form}>
              <View style={auth.inputContainer}>
                <Text
                  nativeID="forgot-password-email-label"
                  style={auth.inputLabel}
                >
                  Bitte gib deine E-Mail ein:
                </Text>
                <TextInput
                  testID="forgot-password-email"
                  accessibilityLabel="Bitte gib deine E-Mail ein:"
                  accessibilityLabelledBy="forgot-password-email-label"
                  style={emailInputStyle}
                  placeholder="beispielname@email.com"
                  autoComplete="email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={inputsEditable}
                  returnKeyType="send"
                  value={formValues.email}
                  onChangeText={handleEmailChange}
                  onFocus={handleEmailFocus}
                  onBlur={handleBlur}
                  onSubmitEditing={recoveryForm}
                />
                <View pointerEvents="none" style={inputIconStyle}>
                  <MailIcon width={24} height={24} />
                </View>
                <Text accessibilityLiveRegion="polite" style={auth.warnText}>
                  {formErrors.email}
                </Text>
              </View>
              <Text style={auth.description}>
                Wir senden Dir eine E-Mail,{"\n"}
                über die Du dein Passwort ändern kannst.
              </Text>
              {renderMessage()}
              {renderLoader()}
              <View style={auth.btnContainer}>
                <Pressable
                  testID="forgot-password-submit"
                  accessibilityRole="button"
                  accessibilityState={{ disabled, busy }}
                  disabled={disabled}
                  onPress={recoveryForm}
                  style={getSubmitStyle}
                >
                  <Text style={submitTextStyle}>E-Mail senden</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
