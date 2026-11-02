import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Link } from "expo-router";
import { Checkbox } from "expo-checkbox";
import { useAuth } from "../../context/auth/useAuth";
import { useSnackbar } from "../../context/snackbar/useSnackbar";
import PreLoader from "../PreLoader/pre-loader";
import { contactStyles } from "./contact.styles";
import PublicLayout from "../../layouts/PublicLayout";
import { auth } from "../../styles/auth";
import { styles } from "../../styles/styles";
import { resets } from "../../styles/resets";
import { colors } from "../../styles/basic";


export default function Contact() {
  const { t, i18n } = useTranslation();
  const { postSupport } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState({});
  const [focused, setFocused] = useState(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const submitting = useRef(false);
  const inputRefs = useRef({});
  const english = i18n.resolvedLanguage?.startsWith("en");
  const valid = {
    name: values.name.trim().length >= 3,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(values.email.trim()),
    message: values.message.trim().length >= 4 && values.message.trim().length <= 5000,
  };
  const disabled = !Object.values(valid).every(Boolean) || !consent || busy;


  async function handleSubmit() {
    if (disabled || submitting.current || sent) {
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      await postSupport({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      });
      setSent(true);
      showSnackbar(english ? "Thank you for your message!" : "Danke für deine Nachricht!", "success");
    } catch (error) {
      const data = error?.response?.data || error?.response;
      const detail = typeof data === "string" ? data : data?.detail || Object.values(data || {}).flat().find((value) => typeof value === "string");
      showSnackbar(detail || (english ? "Your message could not be sent. Please try again." : "Deine Nachricht konnte nicht gesendet werden. Bitte versuche es erneut."), "error");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }


  return (
    <KeyboardAvoidingView style={resets.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <PublicLayout>
        <View style={[styles.container, styles.section]}>
          <Text accessibilityRole="header" style={styles.heading}>{t("CONTACT.TITLE")}</Text>
          <Text style={styles.subtitle}>{t("CONTACT.TITLE_H3")}</Text>
          <Text style={resets.text}>{t("CONTACT.DESCRIPTION_1")}</Text>
          <Text style={resets.text}>{t("CONTACT.DESCRIPTION_2")}</Text>
          <Text style={styles.subtitle}>{t("CONTACT.DESCRIPTION_3")}</Text>
          {sent ? (
            <Text accessibilityLiveRegion="polite" style={resets.text}>
              {english ? "Thank you for your message!" : "Danke für deine Nachricht!"}
            </Text>
          ) : (
            <View style={[auth.form, contactStyles.form]}>
              <View style={auth.inputContainer}>
                <Text nativeID="contact-name-label" style={auth.inputLabel}>{t("CONTACT.FORM_NAME")}</Text>
                <TextInput
                  ref={(input) => { inputRefs.current.name = input; }}
                  testID="contact-name"
                  accessibilityLabel={t("CONTACT.FORM_NAME")}
                  accessibilityLabelledBy="contact-name-label"
                  value={values.name}
                  onChangeText={(value) => setValues((previous) => ({ ...previous, name: value }))}
                  onFocus={() => setFocused("name")}
                  onBlur={() => {
                    setFocused(null);
                    setTouched((previous) => ({ ...previous, name: true }));
                  }}
                  editable={!busy}
                  autoComplete="name"
                  autoCapitalize="sentences"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => inputRefs.current.email?.focus()}
                  style={[
                    auth.inputField,
                    contactStyles.input,
                    focused === "name" && auth.inputFieldFocus,
                    touched.name && !valid.name && contactStyles.invalid,
                  ]}
                />
                <Text accessibilityLiveRegion="polite" style={auth.warnText}>
                  {touched.name && !valid.name ? t("CONTACT.FORM_NAME_REQUIED") : ""}
                </Text>
              </View>
              <View style={auth.inputContainer}>
                <Text nativeID="contact-email-label" style={auth.inputLabel}>{t("CONTACT.FORM_E_MAIL")}</Text>
                <TextInput
                  ref={(input) => { inputRefs.current.email = input; }}
                  testID="contact-email"
                  accessibilityLabel={t("CONTACT.FORM_E_MAIL")}
                  accessibilityLabelledBy="contact-email-label"
                  value={values.email}
                  onChangeText={(value) => setValues((previous) => ({ ...previous, email: value }))}
                  onFocus={() => setFocused("email")}
                  onBlur={() => {
                    setFocused(null);
                    setTouched((previous) => ({ ...previous, email: true }));
                  }}
                  editable={!busy}
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => inputRefs.current.message?.focus()}
                  style={[
                    auth.inputField,
                    contactStyles.input,
                    focused === "email" && auth.inputFieldFocus,
                    touched.email && !valid.email && contactStyles.invalid,
                  ]}
                />
                <Text accessibilityLiveRegion="polite" style={auth.warnText}>
                  {touched.email && !valid.email ? t("CONTACT.FORM_E_MAIL_REQUIED") : ""}
                </Text>
              </View>
              <View style={auth.inputContainer}>
                <Text nativeID="contact-message-label" style={auth.inputLabel}>{t("CONTACT.FORM_MESSAGE")}</Text>
                <TextInput
                  ref={(input) => { inputRefs.current.message = input; }}
                  testID="contact-message"
                  accessibilityLabel={t("CONTACT.FORM_MESSAGE")}
                  accessibilityLabelledBy="contact-message-label"
                  value={values.message}
                  onChangeText={(value) => setValues((previous) => ({ ...previous, message: value }))}
                  onFocus={() => setFocused("message")}
                  onBlur={() => {
                    setFocused(null);
                    setTouched((previous) => ({ ...previous, message: true }));
                  }}
                  editable={!busy}
                  autoCapitalize="sentences"
                  multiline
                  maxLength={5000}
                  returnKeyType="default"
                  submitBehavior="newline"
                  style={[
                    auth.inputField,
                    contactStyles.input,
                    contactStyles.message,
                    focused === "message" && auth.inputFieldFocus,
                    touched.message && !valid.message && contactStyles.invalid,
                  ]}
                />
                <Text accessibilityLiveRegion="polite" style={auth.warnText}>
                  {touched.message && !valid.message ? t("CONTACT.FORM_MESSAGE_REQUIED") : ""}
                </Text>
              </View>
              <Text style={contactStyles.counter}>{values.message.length}/5000</Text>
              <View style={auth.checkboxContainer}>
                <Checkbox
                  testID="contact-consent"
                  value={consent}
                  onValueChange={setConsent}
                  disabled={busy}
                  color={colors.qwPrimary}
                  hitSlop={12}
                  accessibilityLabel={t("CONTACT.CHECKBOX")}
                  style={auth.checkbox}
                />
                <Text style={[auth.checkboxLabel, contactStyles.consent]}>
                  {t("CONTACT.PRIVACY_1")}{" "}
                  <Link href="/privacy-policy" style={auth.privacy}>{t("CONTACT.PRIVACY_2")}</Link>{" "}
                  {t("CONTACT.PRIVACY_3")}
                </Text>
              </View>
              {busy && <PreLoader />}
              <Pressable
                testID="contact-submit"
                accessibilityRole="button"
                accessibilityState={{ disabled, busy }}
                disabled={disabled}
                onPress={handleSubmit}
                style={({ pressed }) => [styles.button, contactStyles.submit, disabled && styles.buttonDisabled, pressed && !disabled && styles.pressed]}
              >
                <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
                  {t("CONTACT.SUBMIT_BUTTON", { defaultValue: english ? "Send" : "Senden" })}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </PublicLayout>
    </KeyboardAvoidingView>
  );
}



